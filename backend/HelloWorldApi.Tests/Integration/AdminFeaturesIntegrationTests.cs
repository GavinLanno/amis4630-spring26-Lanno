using HelloWorldApi.DTOs;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace HelloWorldApi.Tests.Integration;

public class AdminFeaturesIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public AdminFeaturesIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetAllOrders_WithAdminRole_ReturnsOk()
    {
        using var client = _factory.CreateClient();
        await LoginAsAdminAsync(client);

        var response = await client.GetAsync("https://localhost/api/orders");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAllOrders_WithUserRole_ReturnsForbidden()
    {
        using var client = _factory.CreateClient();
        await RegisterAndLoginAsUserAsync(client);

        var response = await client.GetAsync("https://localhost/api/orders");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateOrderStatus_WithAdminRole_UpdatesOrder()
    {
        using var adminClient = _factory.CreateClient();
        using var userClient = _factory.CreateClient();

        await RegisterAndLoginAsUserAsync(userClient);

        var addToCartResponse = await userClient.PostAsJsonAsync("https://localhost/api/cart", new AddToCartDto
        {
            ListingId = 1,
            Quantity = 1
        });
        Assert.Equal(HttpStatusCode.Created, addToCartResponse.StatusCode);

        var placeOrderResponse = await userClient.PostAsJsonAsync(
            "https://localhost/api/orders",
            new PlaceOrderRequestDto(
                FullName: "Buckeye Buyer",
                AddressLine1: "123 College Ave",
                City: "Columbus",
                StateProvince: "OH",
                PostalCode: "43210",
                Country: "USA",
                PhoneNumber: "614-555-1234"));

        Assert.Equal(HttpStatusCode.Created, placeOrderResponse.StatusCode);

        var createdOrder = await placeOrderResponse.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(createdOrder);

        await LoginAsAdminAsync(adminClient);

        var updateStatusResponse = await adminClient.PutAsJsonAsync(
            $"https://localhost/api/orders/{createdOrder!.Id}/status",
            new UpdateOrderStatusRequestDto("Shipped"));

        Assert.Equal(HttpStatusCode.OK, updateStatusResponse.StatusCode);

        var updatedOrder = await updateStatusResponse.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(updatedOrder);
        Assert.Equal("Shipped", updatedOrder!.Status);
    }

    [Fact]
    public async Task ListingCrud_WithAdminRole_AndWithUserRoleAuthorization_WorksAsExpected()
    {
        using var adminClient = _factory.CreateClient();
        using var userClient = _factory.CreateClient();

        await RegisterAndLoginAsUserAsync(userClient);

        var userCreateResponse = await userClient.PostAsJsonAsync(
            "https://localhost/api/listings",
            BuildListingCreateRequest());

        Assert.Equal(HttpStatusCode.Forbidden, userCreateResponse.StatusCode);

        await LoginAsAdminAsync(adminClient);

        var adminCreateResponse = await adminClient.PostAsJsonAsync(
            "https://localhost/api/listings",
            BuildListingCreateRequest());

        Assert.Equal(HttpStatusCode.Created, adminCreateResponse.StatusCode);

        var createdListing = await adminCreateResponse.Content.ReadFromJsonAsync<ListingDto>();
        Assert.NotNull(createdListing);

        var adminUpdateResponse = await adminClient.PutAsJsonAsync(
            $"https://localhost/api/listings/{createdListing!.Id}",
            BuildListingUpdateRequest());

        Assert.Equal(HttpStatusCode.OK, adminUpdateResponse.StatusCode);

        var updatedListing = await adminUpdateResponse.Content.ReadFromJsonAsync<ListingDto>();
        Assert.NotNull(updatedListing);
        Assert.Contains("Updated", updatedListing!.Description);

        var adminDeleteResponse = await adminClient.DeleteAsync($"https://localhost/api/listings/{createdListing.Id}");
        Assert.Equal(HttpStatusCode.NoContent, adminDeleteResponse.StatusCode);

        var getDeletedListingResponse = await adminClient.GetAsync($"https://localhost/api/listings/{createdListing.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getDeletedListingResponse.StatusCode);
    }

    private static CreateListingRequestDto BuildListingCreateRequest()
    {
        return new CreateListingRequestDto(
            Address: $"{Guid.NewGuid():N} Admin Way",
            Description: "New admin created listing",
            Price: 319000m,
            CategoryId: 1,
            SellerName: "Admin User",
            ImageURL: "/images/listings/admin-created.jpg");
    }

    private static UpdateListingRequestDto BuildListingUpdateRequest()
    {
        return new UpdateListingRequestDto(
            Address: "456 Updated Admin Way",
            Description: "Updated listing description",
            Price: 325000m,
            CategoryId: 2,
            SellerName: "Admin User",
            ImageURL: "/images/listings/admin-updated.jpg");
    }

    private static async Task LoginAsAdminAsync(HttpClient client)
    {
        var loginResponse = await client.PostAsJsonAsync(
            "https://localhost/api/auth/login",
            new CreateTokenRequestDto("admin", "AdminPass1"));

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();
        Assert.NotNull(loginPayload);
        Assert.False(string.IsNullOrWhiteSpace(loginPayload!.AccessToken));

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", loginPayload.AccessToken);
    }

    private static async Task RegisterAndLoginAsUserAsync(HttpClient client)
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

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", loginPayload.AccessToken);
    }
}