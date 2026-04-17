using HelloWorldApi.DTOs;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace HelloWorldApi.Tests.Integration;

public class OrdersIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public OrdersIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PlaceOrder_WithoutBearerToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("https://localhost/api/orders", BuildOrderRequest());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PlaceOrder_WithAuthenticatedUser_CreatesOrderAndClearsCart()
    {
        using var client = _factory.CreateClient();
        await RegisterAndLoginAsync(client);

        var addResponse = await client.PostAsJsonAsync("https://localhost/api/cart", new AddToCartDto
        {
            ListingId = 1,
            Quantity = 2
        });

        Assert.Equal(HttpStatusCode.Created, addResponse.StatusCode);

        var placeOrderResponse = await client.PostAsJsonAsync("https://localhost/api/orders", BuildOrderRequest());

        Assert.Equal(HttpStatusCode.Created, placeOrderResponse.StatusCode);

        var createdOrder = await placeOrderResponse.Content.ReadFromJsonAsync<OrderDto>();

        Assert.NotNull(createdOrder);
        Assert.True(createdOrder!.Id > 0);
        Assert.StartsWith("BSL-", createdOrder.ConfirmationNumber);
        Assert.Equal("Placed", createdOrder.Status);
        Assert.True(createdOrder.Total > 0);
        Assert.NotEmpty(createdOrder.Items);

        var cartResponse = await client.GetAsync("https://localhost/api/cart");
        Assert.Equal(HttpStatusCode.OK, cartResponse.StatusCode);

        var cart = await cartResponse.Content.ReadFromJsonAsync<CartDto>();

        Assert.NotNull(cart);
        Assert.Empty(cart!.CartItems);

        var historyResponse = await client.GetAsync("https://localhost/api/orders/mine");
        Assert.Equal(HttpStatusCode.OK, historyResponse.StatusCode);

        var history = await historyResponse.Content.ReadFromJsonAsync<List<OrderDto>>();

        Assert.NotNull(history);
        Assert.Single(history!);
        Assert.Equal(createdOrder.Id, history[0].Id);
        Assert.False(string.IsNullOrWhiteSpace(history[0].ShippingAddress));
    }

    [Fact]
    public async Task GetMyOrders_WithDifferentUsers_ReturnsOnlyCurrentUsersOrders()
    {
        using var userAClient = _factory.CreateClient();
        using var userBClient = _factory.CreateClient();

        var (userAId, _) = await RegisterAndLoginAsync(userAClient);
        var (userBId, _) = await RegisterAndLoginAsync(userBClient);

        var userAAdd = await userAClient.PostAsJsonAsync("https://localhost/api/cart", new AddToCartDto
        {
            ListingId = 1,
            Quantity = 1
        });
        Assert.Equal(HttpStatusCode.Created, userAAdd.StatusCode);

        var userAOrder = await userAClient.PostAsJsonAsync("https://localhost/api/orders", BuildOrderRequest(userAId));
        Assert.Equal(HttpStatusCode.Created, userAOrder.StatusCode);
        var userAOrderPayload = await userAOrder.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(userAOrderPayload);

        var userBAdd = await userBClient.PostAsJsonAsync("https://localhost/api/cart", new AddToCartDto
        {
            ListingId = 2,
            Quantity = 1
        });
        Assert.Equal(HttpStatusCode.Created, userBAdd.StatusCode);

        var userBOrder = await userBClient.PostAsJsonAsync("https://localhost/api/orders", BuildOrderRequest(userBId));
        Assert.Equal(HttpStatusCode.Created, userBOrder.StatusCode);
        var userBOrderPayload = await userBOrder.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(userBOrderPayload);

        var userAHistoryResponse = await userAClient.GetAsync("https://localhost/api/orders/mine");
        Assert.Equal(HttpStatusCode.OK, userAHistoryResponse.StatusCode);
        var userAHistory = await userAHistoryResponse.Content.ReadFromJsonAsync<List<OrderDto>>();

        Assert.NotNull(userAHistory);
        Assert.Single(userAHistory!);
        Assert.Equal(userAOrderPayload!.Id, userAHistory[0].Id);
        Assert.DoesNotContain(userBOrderPayload!.Id, userAHistory.Select(item => item.Id));

        var userBHistoryResponse = await userBClient.GetAsync("https://localhost/api/orders/mine");
        Assert.Equal(HttpStatusCode.OK, userBHistoryResponse.StatusCode);
        var userBHistory = await userBHistoryResponse.Content.ReadFromJsonAsync<List<OrderDto>>();

        Assert.NotNull(userBHistory);
        Assert.Single(userBHistory!);
        Assert.Equal(userBOrderPayload!.Id, userBHistory[0].Id);
        Assert.DoesNotContain(userAOrderPayload.Id, userBHistory.Select(item => item.Id));
    }

    [Fact]
    public async Task PlaceOrder_WithEmptyCart_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();
        await RegisterAndLoginAsync(client);

        var response = await client.PostAsJsonAsync("https://localhost/api/orders", BuildOrderRequest());

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static PlaceOrderRequestDto BuildOrderRequest(string fullNamePrefix = "Buckeye Buyer")
    {
        return new PlaceOrderRequestDto(
            FullName: fullNamePrefix,
            AddressLine1: "123 College Ave",
            City: "Columbus",
            StateProvince: "OH",
            PostalCode: "43210",
            Country: "USA",
            PhoneNumber: "614-555-1234");
    }

    private static async Task<(string UserId, string Password)> RegisterAndLoginAsync(HttpClient client)
    {
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
        Assert.False(string.IsNullOrWhiteSpace(loginPayload!.AccessToken));

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginPayload.AccessToken);

        return (userId, password);
    }
}
