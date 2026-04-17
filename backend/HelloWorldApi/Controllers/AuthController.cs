using FluentValidation;
using HelloWorldApi.Data;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private static readonly TimeSpan AccessTokenTtl = TimeSpan.FromHours(1);
    private static readonly TimeSpan RefreshTokenTtl = TimeSpan.FromDays(7);

    private readonly ListingContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<AuthUser> _passwordHasher;
    private readonly IPasswordHasher<RefreshToken> _refreshTokenHasher;
    private readonly IValidator<RegisterRequestDto> _registerValidator;

    public AuthController(
        ListingContext context,
        IConfiguration configuration,
        IPasswordHasher<AuthUser> passwordHasher,
        IPasswordHasher<RefreshToken> refreshTokenHasher,
        IValidator<RegisterRequestDto> registerValidator)
    {
        _context = context;
        _configuration = configuration;
        _passwordHasher = passwordHasher;
        _refreshTokenHasher = refreshTokenHasher;
        _registerValidator = registerValidator;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult> Register(RegisterRequestDto request)
    {
        var validationResult = await _registerValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid registration request",
                Detail = string.Join(" ", validationResult.Errors.Select(error => error.ErrorMessage).Distinct())
            });
        }

        var duplicateUserExists = await _context.AuthUsers.AnyAsync(user =>
            user.UserId == request.UserId || user.Email == request.Email);

        if (duplicateUserExists)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "User already exists",
                Detail = $"A user with ID '{request.UserId}' or email '{request.Email}' already exists."
            });
        }

        var user = new AuthUser
        {
            UserId = request.UserId,
            Email = request.Email,
            Role = NormalizeRole(request.Role)
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.AuthUsers.Add(user);
        await _context.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpPost("token")]
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<TokenResponseDto>> CreateToken(CreateTokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid token request",
                Detail = "UserId and Password are required to create a token."
            });
        }

        var user = await _context.AuthUsers.FirstOrDefaultAsync(candidate =>
            candidate.UserId == request.UserId || candidate.Email == request.UserId);

        if (user is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid credentials",
                Detail = "Invalid user ID or password."
            });
        }

        var verificationResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid credentials",
                Detail = "Invalid user ID or password."
            });
        }

        var (accessToken, accessTokenExpiresAtUtc) = CreateAccessToken(user);
        var (refreshTokenEntity, refreshTokenPlainText) = CreateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        return Ok(new TokenResponseDto(accessToken, accessTokenExpiresAtUtc, refreshTokenPlainText));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid refresh token request",
                Detail = "RefreshToken is required."
            });
        }

        var activeRefreshTokens = await _context.RefreshTokens
            .Include(token => token.AuthUser)
            .Where(token => token.RevokedAtUtc == null && token.ExpiresAtUtc > DateTime.UtcNow)
            .ToListAsync();

        var matchedToken = activeRefreshTokens.FirstOrDefault(token =>
            _refreshTokenHasher.VerifyHashedPassword(token, token.TokenHash, request.RefreshToken)
            != PasswordVerificationResult.Failed);

        if (matchedToken is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid refresh token",
                Detail = "The supplied refresh token is invalid or expired."
            });
        }

        matchedToken.RevokedAtUtc = DateTime.UtcNow;

        var (accessToken, accessTokenExpiresAtUtc) = CreateAccessToken(matchedToken.AuthUser);
        var (refreshTokenEntity, refreshTokenPlainText) = CreateRefreshToken(matchedToken.AuthUserId);

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        return Ok(new TokenResponseDto(accessToken, accessTokenExpiresAtUtc, refreshTokenPlainText));
    }

    private (string AccessToken, DateTime ExpiresAtUtc) CreateAccessToken(AuthUser user)
    {
        var jwtSigningKey = _configuration["JWT_SIGNING_KEY"];

        if (string.IsNullOrWhiteSpace(jwtSigningKey))
        {
            throw new InvalidOperationException("JWT_SIGNING_KEY is not configured.");
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId),
            new(ClaimTypes.Role, user.Role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };

        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            SecurityAlgorithms.HmacSha256);

        var expiresAtUtc = DateTime.UtcNow.Add(AccessTokenTtl);

        var tokenDescriptor = new JwtSecurityToken(
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: signingCredentials);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

        return (accessToken, expiresAtUtc);
    }

    private (RefreshToken RefreshToken, string PlainTextToken) CreateRefreshToken(int authUserId)
    {
        var plainTextToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var refreshToken = new RefreshToken
        {
            AuthUserId = authUserId,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.Add(RefreshTokenTtl)
        };

        refreshToken.TokenHash = _refreshTokenHasher.HashPassword(refreshToken, plainTextToken);

        return (refreshToken, plainTextToken);
    }

    private static string NormalizeRole(string role)
    {
        return role.Trim().ToLowerInvariant() switch
        {
            "admin" => "Admin",
            _ => "User"
        };
    }
}