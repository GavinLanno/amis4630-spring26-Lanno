using System.Net;

namespace HelloWorldApi.Tests.Integration;

public class CartAuthorizationIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public CartAuthorizationIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetCart_WithoutBearerToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("https://localhost/api/cart");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
