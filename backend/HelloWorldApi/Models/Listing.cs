// Listing.cs - Model
// Represents a single property listing in the database.
// EF Core maps this class to the Listings table via ListingContext.
// CategoryId is a foreign key to Category.cs.
// Referenced by CartItem.cs via ListingId to bring listing details into the cart.

namespace HelloWorldApi.Models;

public class Listing
{
    public int Id { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }                          // foreign key
    public Category Category { get; set; } = null!;             // navigation property
    public string SellerName { get; set; } = string.Empty;
    public DateTime PostedDate { get; set; }
    public string ImageURL { get; set; } = string.Empty;
}