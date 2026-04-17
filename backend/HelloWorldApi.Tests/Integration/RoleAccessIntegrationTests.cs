using HelloWorldApi.DTOs;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace HelloWorldApi.Tests.Integration;

public class RoleAccessIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public RoleAccessIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Checkout_WithoutBearerToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsync("https://localhost/api/checkout", content: null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Checkout_WithUserRole_ReturnsOk()
    {
        using var client = _factory.CreateClient();
        var userId = $"user-{Guid.NewGuid():N}";
        var password = "UserPass123";

        var registerResponse = await client.PostAsJsonAsync(
            "https://localhost/api/auth/register",
            new RegisterRequestDto(userId, $"{userId}@example.com", password, "User"));
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        var loginResponse = await client.PostAsJsonAsync(
            "https://localhost/api/auth/login",
            new CreateTokenRequestDto(userId, password));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();
        Assert.NotNull(loginPayload);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginPayload!.AccessToken);

        var checkoutResponse = await client.PostAsync("https://localhost/api/checkout", content: null);

        Assert.Equal(HttpStatusCode.OK, checkoutResponse.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_WithUserRole_ReturnsForbidden()
    {
        using var client = _factory.CreateClient();
        var userId = $"member-{Guid.NewGuid():N}";
        var password = "UserPass123";

        var registerResponse = await client.PostAsJsonAsync(
            "https://localhost/api/auth/register",
            new RegisterRequestDto(userId, $"{userId}@example.com", password, "User"));
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        var loginResponse = await client.PostAsJsonAsync(
            "https://localhost/api/auth/login",
            new CreateTokenRequestDto(userId, password));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();
        Assert.NotNull(loginPayload);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginPayload!.AccessToken);

        var adminResponse = await client.GetAsync("https://localhost/api/admin/status");

        Assert.Equal(HttpStatusCode.Forbidden, adminResponse.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_WithAdminRole_ReturnsOk()
    {
        using var client = _factory.CreateClient();

        var loginResponse = await client.PostAsJsonAsync(
            "https://localhost/api/auth/login",
            new CreateTokenRequestDto("admin", "AdminPass1"));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();
        Assert.NotNull(loginPayload);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginPayload!.AccessToken);

        var adminResponse = await client.GetAsync("https://localhost/api/admin/status");

        Assert.Equal(HttpStatusCode.OK, adminResponse.StatusCode);
    }
}
