using HelloWorldApi.Controllers;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace HelloWorldApi.Tests.Unit;

public class AuthControllerTests
{
    [Fact]
    public void CreateToken_WithWrongPassword_ReturnsUnauthorizedProblemDetails()
    {
        var controller = BuildController();
        var userId = $"user-{Guid.NewGuid():N}";

        var registerResult = controller.Register(new RegisterRequestDto(userId, "CorrectPassword123!", "User"));
        Assert.IsType<StatusCodeResult>(registerResult);

        var result = controller.CreateToken(new CreateTokenRequestDto(userId, "WrongPassword123!"));

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
        var problem = Assert.IsType<ProblemDetails>(unauthorized.Value);

        Assert.Equal(401, unauthorized.StatusCode);
        Assert.Equal("Invalid credentials", problem.Title);
        Assert.Equal("Invalid user ID or password.", problem.Detail);
    }

    [Fact]
    public void CreateToken_WithValidCredentials_ReturnsTokenContainingUserIdAndRoleClaims()
    {
        var controller = BuildController();
        var userId = $"admin-{Guid.NewGuid():N}";

        var registerResult = controller.Register(new RegisterRequestDto(userId, "AdminPassword123!", "Admin"));
        Assert.IsType<StatusCodeResult>(registerResult);

        var result = controller.CreateToken(new CreateTokenRequestDto(userId, "AdminPassword123!"));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<TokenResponseDto>(ok.Value);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(payload.AccessToken);

        Assert.Equal(userId, jwt.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal("Admin", jwt.Claims.First(c => c.Type == ClaimTypes.Role).Value);
        Assert.True(payload.ExpiresAtUtc > DateTime.UtcNow);
    }

    private static AuthController BuildController()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JWT_SIGNING_KEY"] = "unit-tests-signing-key-at-least-32-chars"
            })
            .Build();

        var passwordHasher = new PasswordHasher<AuthUser>();

        return new AuthController(configuration, passwordHasher);
    }
}
