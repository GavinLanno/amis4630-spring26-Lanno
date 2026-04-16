using HelloWorldApi.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace HelloWorldApi.Tests.Integration;

public class AuthIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public AuthIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_WithSeededAdminAtLoginRoute_ReturnsTokens()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("https://localhost/api/auth/login", new CreateTokenRequestDto("admin", "AdminPass1"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var payload = await response.Content.ReadFromJsonAsync<TokenResponseDto>();

        Assert.NotNull(payload);
        Assert.False(string.IsNullOrWhiteSpace(payload!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(payload.RefreshToken));
    }

    [Fact]
    public async Task Refresh_WithValidRefreshToken_ReturnsNewTokens()
    {
        using var client = _factory.CreateClient();

        var loginResponse = await client.PostAsJsonAsync("https://localhost/api/auth/login", new CreateTokenRequestDto("admin", "AdminPass1"));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();
        Assert.NotNull(loginPayload);
        Assert.False(string.IsNullOrWhiteSpace(loginPayload!.RefreshToken));

        var refreshResponse = await client.PostAsJsonAsync("https://localhost/api/auth/refresh", new RefreshTokenRequestDto(loginPayload.RefreshToken!));

        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);

        var refreshPayload = await refreshResponse.Content.ReadFromJsonAsync<TokenResponseDto>();

        Assert.NotNull(refreshPayload);
        Assert.NotEqual(loginPayload.AccessToken, refreshPayload!.AccessToken);
        Assert.NotEqual(loginPayload.RefreshToken, refreshPayload.RefreshToken);
    }
}
