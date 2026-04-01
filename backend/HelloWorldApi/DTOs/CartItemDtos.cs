// CartItemDto.cs - DTO (Data Transfer Object)
// Shapes a single cart item returned inside CartDto.cs.
// Flattens Listing and Category navigation properties (Address, Price, ImageURL, CategoryName)
// so the frontend receives a flat object instead of deeply nested data.
// LineTotal is computed from Price * Quantity — never stored in the database.

namespace HelloWorldApi.DTOs;

public class CartItemDto
{
    public int Id { get; set; }
    public int ListingId { get; set; }
    public string Address { get; set; } = string.Empty;
    public string ImageURL { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal LineTotal => Price * Quantity;
}