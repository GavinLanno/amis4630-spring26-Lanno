// AddToCartDto.cs - DTO (Data Transfer Object)
// Represents the request body for POST /api/cart.
// Carries the ListingId and Quantity chosen by the user on the frontend.
// Validated in the cart controller before a new CartItem is created.

namespace HelloWorldApi.DTOs;

public class AddToCartDto
{
    public int ListingId { get; set; }
    public int Quantity { get; set; }
}