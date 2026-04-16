using HelloWorldApi.DTOs;
using System.Net;
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
}
