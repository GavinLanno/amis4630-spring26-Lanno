// Cart.cs - Model
// Represents a user's shopping cart in the database.
// EF Core maps this class to the Carts table via ListingContext.
// UserId is hardcoded for now and will be replaced with real auth in M5.
// Owns a collection of CartItem.cs — deleting a cart should cascade delete its items.

using System.ComponentModel.DataAnnotations;

namespace HelloWorldApi.Models;

public class Cart
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}