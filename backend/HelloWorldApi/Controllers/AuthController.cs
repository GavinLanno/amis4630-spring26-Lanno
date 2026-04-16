using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private static readonly ConcurrentDictionary<string, AuthUser> Users = new();
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<AuthUser> _passwordHasher;

    public AuthController(
        IConfiguration configuration,
        IPasswordHasher<AuthUser> passwordHasher)
    {
        _configuration = configuration;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult Register(RegisterRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId)
            || string.IsNullOrWhiteSpace(request.Password)
            || string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid registration request",
                Detail = "UserId, Password, and Role are required."
            });
        }

        if (Users.ContainsKey(request.UserId))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "User already exists",
                Detail = $"A user with ID '{request.UserId}' already exists."
            });
        }

        var user = new AuthUser
        {
            UserId = request.UserId,
            Role = request.Role
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        if (!Users.TryAdd(user.UserId, user))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "User already exists",
                Detail = $"A user with ID '{request.UserId}' already exists."
            });
        }

        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpPost("token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public ActionResult<TokenResponseDto> CreateToken(CreateTokenRequestDto request)
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

        if (!Users.TryGetValue(request.UserId, out var user))
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

        var jwtSigningKey = _configuration["JWT_SIGNING_KEY"];

        if (string.IsNullOrWhiteSpace(jwtSigningKey))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Missing JWT signing key",
                Detail = "JWT_SIGNING_KEY is not configured."
            });
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId),
            new(ClaimTypes.Role, user.Role)
        };

        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            SecurityAlgorithms.HmacSha256);

        var expiresAtUtc = DateTime.UtcNow.AddHours(1);

        var tokenDescriptor = new JwtSecurityToken(
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: signingCredentials);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

        return Ok(new TokenResponseDto(accessToken, expiresAtUtc));
    }
}