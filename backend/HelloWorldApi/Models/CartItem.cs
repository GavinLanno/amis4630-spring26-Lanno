// CartItem.cs - Model
// Represents a single listing inside a cart.
// EF Core maps this class to the CartItems table via ListingContext.
// Holds foreign keys to Cart.cs, Listing.cs, and Category.cs.
// Quantity is managed by PUT /api/cart/{cartItemId} in the cart controller.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelloWorldApi.Models;

public class CartItem
{
    public int Id { get; set; }

    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public int Quantity { get; set; }
}