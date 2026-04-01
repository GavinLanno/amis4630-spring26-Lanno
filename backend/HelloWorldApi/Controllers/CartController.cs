// CartController.cs - Controller
// Handles all HTTP requests for the Cart resource.
// Injects ListingContext via dependency injection to query and persist cart data.
// Uses a hardcoded UserId (replaced with real auth in M5).
// Maps Cart and CartItem models to CartDto and CartItemDto before sending to the frontend.
// Endpoints: GET /api/cart, POST /api/cart, PUT /api/cart/{id},
//            DELETE /api/cart/{id}, DELETE /api/cart/clear

using HelloWorldApi.Data;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private const string CurrentUserId = "default-user";
    private readonly ListingContext _context;

    public CartController(ListingContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var cart = await GetCartWithItemsAsync();

        if (cart is null)
        {
            return Ok(new CartDto());
        }

        return Ok(MapCart(cart));
    }

    [HttpPost]
    public async Task<ActionResult<CartDto>> AddToCart(AddToCartDto request)
    {
        if (request.Quantity <= 0)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid quantity",
                Detail = "Quantity must be greater than zero."
            });
        }

        var listing = await _context.Listings
            .Include(item => item.Category)
            .FirstOrDefaultAsync(item => item.Id == request.ListingId);

        if (listing is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Listing not found",
                Detail = $"Listing with ID {request.ListingId} was not found."
            });
        }

        var cart = await _context.Carts
            .Include(item => item.CartItems)
            .FirstOrDefaultAsync(item => item.UserId == CurrentUserId);

        if (cart is null)
        {
            cart = new Cart
            {
                UserId = CurrentUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Carts.Add(cart);
        }

        var existingCartItem = cart.CartItems
            .FirstOrDefault(item => item.ListingId == request.ListingId);

        var isNewCartItem = existingCartItem is null;

        if (isNewCartItem)
        {
            cart.CartItems.Add(new CartItem
            {
                ListingId = listing.Id,
                CategoryId = listing.CategoryId,
                Quantity = request.Quantity
            });
        }
        else
        {
            existingCartItem.Quantity += request.Quantity;
            existingCartItem.CategoryId = listing.CategoryId;
        }

        await _context.SaveChangesAsync();

        var updatedCart = await GetCartWithItemsAsync();

        var response = MapCart(updatedCart!);

        if (isNewCartItem)
        {
            return CreatedAtAction(nameof(GetCart), null, response);
        }

        return Ok(response);
    }

    [HttpPut("{cartItemId:int}")]
    public async Task<ActionResult<CartDto>> UpdateCartItem(int cartItemId, UpdateCartItemDto request)
    {
        if (request.Quantity <= 0)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid quantity",
                Detail = "Quantity must be greater than zero."
            });
        }

        var cartItem = await _context.CartItems
            .Include(item => item.Cart)
            .FirstOrDefaultAsync(item => item.Id == cartItemId && item.Cart.UserId == CurrentUserId);

        if (cartItem is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Cart item not found",
                Detail = $"Cart item with ID {cartItemId} was not found."
            });
        }

        cartItem.Quantity = request.Quantity;

        await _context.SaveChangesAsync();

        var updatedCart = await GetCartWithItemsAsync();

        return Ok(MapCart(updatedCart!));
    }

    [HttpDelete("{cartItemId:int}")]
    public async Task<ActionResult<CartDto>> RemoveCartItem(int cartItemId)
    {
        var cartItem = await _context.CartItems
            .Include(item => item.Cart)
            .FirstOrDefaultAsync(item => item.Id == cartItemId && item.Cart.UserId == CurrentUserId);

        if (cartItem is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Cart item not found",
                Detail = $"Cart item with ID {cartItemId} was not found."
            });
        }

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        var updatedCart = await GetCartWithItemsAsync();

        if (updatedCart is null)
        {
            return Ok(new CartDto());
        }

        return Ok(MapCart(updatedCart));
    }

    [HttpDelete("clear")]
    public async Task<ActionResult<CartDto>> ClearCart()
    {
        var cart = await _context.Carts
            .Include(item => item.CartItems)
            .FirstOrDefaultAsync(item => item.UserId == CurrentUserId);

        if (cart is null)
        {
            return Ok(new CartDto());
        }

        _context.CartItems.RemoveRange(cart.CartItems);
        await _context.SaveChangesAsync();

        return Ok(new CartDto
        {
            Id = cart.Id
        });
    }

    private Task<Cart?> GetCartWithItemsAsync()
    {
        return _context.Carts
            .Include(item => item.CartItems)
            .ThenInclude(item => item.Listing)
            .ThenInclude(item => item.Category)
            .FirstOrDefaultAsync(item => item.UserId == CurrentUserId);
    }

    private static CartDto MapCart(Cart cart)
    {
        return new CartDto
        {
            Id = cart.Id,
            CartItems = cart.CartItems
                .Select(item => new CartItemDto
                {
                    Id = item.Id,
                    ListingId = item.ListingId,
                    Address = item.Listing.Address,
                    ImageURL = item.Listing.ImageURL,
                    Price = item.Listing.Price,
                    CategoryName = item.Listing.Category.Name,
                    Quantity = item.Quantity
                })
                .ToList()
        };
    }
}
