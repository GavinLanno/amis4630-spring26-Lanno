using HelloWorldApi.DTOs;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace HelloWorldApi.Tests.Integration;

public class CartAuthorizationIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public CartAuthorizationIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetCart_WithoutBearerToken_ReturnsOkAndGuestSessionHeader()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("https://localhost/api/cart");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("X-Session-Id", out var sessionIds));

        var sessionId = Assert.Single(sessionIds!);
        Assert.False(string.IsNullOrWhiteSpace(sessionId));

        var cart = await response.Content.ReadFromJsonAsync<CartDto>();

        Assert.NotNull(cart);
        Assert.Empty(cart!.CartItems);
    }

    [Fact]
    public async Task AddToCart_WithoutBearerToken_ReusesGuestSessionAcrossRequests()
    {
        using var client = _factory.CreateClient();

        var addRequest = new AddToCartDto
        {
            ListingId = 1,
            Quantity = 1
        };

        var firstResponse = await client.PostAsJsonAsync("https://localhost/api/cart", addRequest);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);
        Assert.True(firstResponse.Headers.TryGetValues("X-Session-Id", out var firstSessionIds));

        var sessionId = Assert.Single(firstSessionIds!);
        Assert.False(string.IsNullOrWhiteSpace(sessionId));

        var secondRequest = new HttpRequestMessage(HttpMethod.Post, "https://localhost/api/cart")
        {
            Content = JsonContent.Create(addRequest)
        };

        secondRequest.Headers.Add("X-Session-Id", sessionId);

        var secondResponse = await client.SendAsync(secondRequest);

        Assert.Equal(HttpStatusCode.OK, secondResponse.StatusCode);
        Assert.True(secondResponse.Headers.TryGetValues("X-Session-Id", out var secondSessionIds));
        Assert.Equal(sessionId, Assert.Single(secondSessionIds!));

        var cart = await secondResponse.Content.ReadFromJsonAsync<CartDto>();

        Assert.NotNull(cart);
        Assert.Single(cart!.CartItems);
        Assert.Equal(2, cart.CartItems[0].Quantity);
    }

    [Fact]
    public async Task CartMutations_WithoutBearerToken_ReturnUnauthorized()
    {
        using var client = _factory.CreateClient();

        var updateResponse = await client.PutAsJsonAsync("https://localhost/api/cart/1", new UpdateCartItemDto
        {
            Quantity = 2
        });
        var removeResponse = await client.DeleteAsync("https://localhost/api/cart/1");
        var clearResponse = await client.DeleteAsync("https://localhost/api/cart/clear");

        Assert.Equal(HttpStatusCode.Unauthorized, updateResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, removeResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, clearResponse.StatusCode);
    }

    [Fact]
    public async Task CartMutations_WithBearerToken_ReturnSuccess()
    {
        using var client = _factory.CreateClient();

        var loginResponse = await client.PostAsJsonAsync(
            "https://localhost/api/auth/login",
            new CreateTokenRequestDto("admin", "AdminPass1"));
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();
        Assert.NotNull(loginPayload);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginPayload!.AccessToken);

        var addResponse = await client.PostAsJsonAsync("https://localhost/api/cart", new AddToCartDto
        {
            ListingId = 1,
            Quantity = 1
        });

        Assert.Equal(HttpStatusCode.Created, addResponse.StatusCode);

        var addPayload = await addResponse.Content.ReadFromJsonAsync<CartDto>();
        Assert.NotNull(addPayload);
        var cartItemId = Assert.Single(addPayload!.CartItems).Id;

        var updateResponse = await client.PutAsJsonAsync($"https://localhost/api/cart/{cartItemId}", new UpdateCartItemDto
        {
            Quantity = 3
        });

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var removeResponse = await client.DeleteAsync($"https://localhost/api/cart/{cartItemId}");

        Assert.Equal(HttpStatusCode.OK, removeResponse.StatusCode);

        var clearResponse = await client.DeleteAsync("https://localhost/api/cart/clear");

        Assert.Equal(HttpStatusCode.OK, clearResponse.StatusCode);
    }
}
