using HelloWorldApi.DTOs;

namespace HelloWorldApi.Tests.Unit;

public class CartPricingTests
{
    [Fact]
    public void CartItemDto_LineTotal_IsPriceTimesQuantity()
    {
        var item = new CartItemDto
        {
            Price = 249.50m,
            Quantity = 3
        };

        Assert.Equal(748.50m, item.LineTotal);
    }

    [Fact]
    public void CartDto_CartTotal_SumsAllLineTotals()
    {
        var cart = new CartDto
        {
            CartItems =
            [
                new CartItemDto { Price = 100m, Quantity = 2 },
                new CartItemDto { Price = 19.99m, Quantity = 5 }
            ]
        };

        Assert.Equal(299.95m, cart.CartTotal);
    }

    [Fact]
    public void CartDto_CartTotal_WithNoItems_IsZero()
    {
        var cart = new CartDto
        {
            CartItems = []
        };

        Assert.Equal(0m, cart.CartTotal);
    }
}
