// CartDto.cs - DTO (Data Transfer Object)
// Shapes the full cart response returned by GET /api/cart.
// Contains a list of CartItemDto.cs and a computed CartTotal.
// CartTotal is calculated automatically from each item's LineTotal — never stored in the database.
// Mapped from Cart.cs in the cart controller.

namespace HelloWorldApi.DTOs;

public class CartDto
{
    public int Id { get; set; }
    public List<CartItemDto> CartItems { get; set; } = new();
    public decimal CartTotal => CartItems.Sum(i => i.LineTotal);
}