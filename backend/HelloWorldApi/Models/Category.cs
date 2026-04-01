// Category.cs - Model
// Represents a property category (e.g. House, Condo, Apartment).
// EF Core maps this class to the Categories table via ListingContext.
// Seeded with initial data in ListingContext.cs via OnModelCreating.
// Linked to Listing.cs through a one-to-many relationship (one category, many listings).
// Linked to CartItem.cs directly via CategoryId for convenient cart queries.

using System.ComponentModel.DataAnnotations;

namespace HelloWorldApi.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<Listing> Listings { get; set; } = new List<Listing>();
}