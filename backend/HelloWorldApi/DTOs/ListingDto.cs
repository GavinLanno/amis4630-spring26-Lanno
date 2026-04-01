// ListingDto.cs - DTO (Data Transfer Object)
// Shapes the listing data sent from the API to the frontend.
// Flattens the Category navigation property into a plain CategoryName string
// so the frontend does not receive nested objects.
// Mapped from Listing.cs in the listings controller.

namespace HelloWorldApi.DTOs;

public class ListingDto
{
    public int Id { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public DateTime PostedDate { get; set; }
    public string ImageURL { get; set; } = string.Empty;
}