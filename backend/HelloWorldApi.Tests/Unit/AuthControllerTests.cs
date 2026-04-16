using FluentValidation;
using HelloWorldApi.Controllers;
using HelloWorldApi.Data;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using HelloWorldApi.Validators;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace HelloWorldApi.Tests.Unit;

public class AuthControllerTests
{
    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsBadRequestProblemDetails()
    {
        var controller = BuildController();

        var registerResult = await controller.Register(new RegisterRequestDto("new-user", "invalid-email", "Password123", "User"));

        var badRequest = Assert.IsType<BadRequestObjectResult>(registerResult);
        var problem = Assert.IsType<ProblemDetails>(badRequest.Value);

        Assert.Equal(400, badRequest.StatusCode);
        Assert.Equal("Invalid registration request", problem.Title);
        Assert.Contains("valid email", problem.Detail, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Register_WithWeakPassword_ReturnsBadRequestProblemDetails()
    {
        var controller = BuildController();

        var registerResult = await controller.Register(new RegisterRequestDto("new-user", "new-user@example.com", "password", "User"));

        var badRequest = Assert.IsType<BadRequestObjectResult>(registerResult);
        var problem = Assert.IsType<ProblemDetails>(badRequest.Value);

        Assert.Equal(400, badRequest.StatusCode);
        Assert.Equal("Invalid registration request", problem.Title);
        Assert.Contains("uppercase", problem.Detail, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateToken_WithWrongPassword_ReturnsUnauthorizedProblemDetails()
    {
        var controller = BuildController();
        var userId = $"user-{Guid.NewGuid():N}";

        var registerResult = await controller.Register(new RegisterRequestDto(userId, $"{userId}@example.com", "CorrectPassword123", "User"));
        Assert.IsType<StatusCodeResult>(registerResult);

        var result = await controller.CreateToken(new CreateTokenRequestDto(userId, "WrongPassword123"));

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
        var problem = Assert.IsType<ProblemDetails>(unauthorized.Value);

        Assert.Equal(401, unauthorized.StatusCode);
        Assert.Equal("Invalid credentials", problem.Title);
        Assert.Equal("Invalid user ID or password.", problem.Detail);
    }

    [Fact]
    public async Task CreateToken_WithValidCredentials_ReturnsTokenContainingUserIdAndRoleClaims()
    {
        var controller = BuildController();
        var userId = $"admin-{Guid.NewGuid():N}";

        var registerResult = await controller.Register(new RegisterRequestDto(userId, $"{userId}@example.com", "AdminPassword123", "Admin"));
        Assert.IsType<StatusCodeResult>(registerResult);

        var result = await controller.CreateToken(new CreateTokenRequestDto(userId, "AdminPassword123"));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<TokenResponseDto>(ok.Value);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(payload.AccessToken);

        Assert.Equal(userId, jwt.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal("Admin", jwt.Claims.First(c => c.Type == ClaimTypes.Role).Value);
        Assert.True(payload.ExpiresAtUtc > DateTime.UtcNow);
        Assert.False(string.IsNullOrWhiteSpace(payload.RefreshToken));
    }

    [Fact]
    public async Task RefreshToken_WithValidRefreshToken_RotatesTokenAndReturnsNewPair()
    {
        var controller = BuildController();
        var userId = $"refresh-{Guid.NewGuid():N}";

        var registerResult = await controller.Register(new RegisterRequestDto(userId, $"{userId}@example.com", "RefreshPassword123", "User"));
        Assert.IsType<StatusCodeResult>(registerResult);

        var tokenResult = await controller.CreateToken(new CreateTokenRequestDto(userId, "RefreshPassword123"));
        var firstTokenOk = Assert.IsType<OkObjectResult>(tokenResult.Result);
        var firstTokenPayload = Assert.IsType<TokenResponseDto>(firstTokenOk.Value);

        var refreshResult = await controller.RefreshToken(new RefreshTokenRequestDto(firstTokenPayload.RefreshToken!));
        var secondTokenOk = Assert.IsType<OkObjectResult>(refreshResult.Result);
        var secondTokenPayload = Assert.IsType<TokenResponseDto>(secondTokenOk.Value);

        Assert.NotEqual(firstTokenPayload.AccessToken, secondTokenPayload.AccessToken);
        Assert.NotEqual(firstTokenPayload.RefreshToken, secondTokenPayload.RefreshToken);
    }

    [Fact]
    public async Task RefreshToken_WithReusedRefreshToken_ReturnsUnauthorizedProblemDetails()
    {
        var controller = BuildController();
        var userId = $"refresh-reuse-{Guid.NewGuid():N}";

        var registerResult = await controller.Register(new RegisterRequestDto(userId, $"{userId}@example.com", "ReusePassword123", "User"));
        Assert.IsType<StatusCodeResult>(registerResult);

        var tokenResult = await controller.CreateToken(new CreateTokenRequestDto(userId, "ReusePassword123"));
        var firstTokenOk = Assert.IsType<OkObjectResult>(tokenResult.Result);
        var firstTokenPayload = Assert.IsType<TokenResponseDto>(firstTokenOk.Value);

        var firstRefresh = await controller.RefreshToken(new RefreshTokenRequestDto(firstTokenPayload.RefreshToken!));
        Assert.IsType<OkObjectResult>(firstRefresh.Result);

        var secondRefresh = await controller.RefreshToken(new RefreshTokenRequestDto(firstTokenPayload.RefreshToken!));
        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(secondRefresh.Result);
        var problem = Assert.IsType<ProblemDetails>(unauthorized.Value);

        Assert.Equal(401, unauthorized.StatusCode);
        Assert.Equal("Invalid refresh token", problem.Title);
    }

    private static AuthController BuildController()
    {
        var options = new DbContextOptionsBuilder<ListingContext>()
            .UseInMemoryDatabase($"auth-tests-{Guid.NewGuid():N}")
            .Options;

        var context = new ListingContext(options);

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JWT_SIGNING_KEY"] = "unit-tests-signing-key-at-least-32-chars"
            })
            .Build();

        var passwordHasher = new PasswordHasher<AuthUser>();
        var refreshTokenHasher = new PasswordHasher<RefreshToken>();
        IValidator<RegisterRequestDto> registerValidator = new RegisterRequestValidator();

        return new AuthController(context, configuration, passwordHasher, refreshTokenHasher, registerValidator);
    }
}
