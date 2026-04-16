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
using System.Security.Claims;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private const string GuestSessionHeaderName = "X-Session-Id";
    private static readonly TimeSpan GuestSessionTtl = TimeSpan.FromHours(24);
    private readonly ListingContext _context;

    public CartController(ListingContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var identity = await ResolveCartIdentityAsync(allowCreateGuestSession: true);

        if (identity is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity or guest cart session is required."
            });
        }

        SetGuestSessionHeader(identity.SessionId);

        var cart = await GetCartWithItemsAsync(identity);

        if (cart is null)
        {
            return Ok(new CartDto());
        }

        return Ok(MapCart(cart));
    }

    [HttpPost]
    public async Task<ActionResult<CartDto>> AddToCart(AddToCartDto request)
    {
        var identity = await ResolveCartIdentityAsync(allowCreateGuestSession: true);

        if (identity is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity or guest cart session is required."
            });
        }

        SetGuestSessionHeader(identity.SessionId);

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

        var cart = await GetOrCreateCartAsync(identity);

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
        else if (existingCartItem is not null)
        {
            existingCartItem.Quantity += request.Quantity;
            existingCartItem.CategoryId = listing.CategoryId;
        }

        await _context.SaveChangesAsync();

        var updatedCart = await GetCartWithItemsAsync(identity);

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
        var identity = await ResolveCartIdentityAsync(allowCreateGuestSession: false);

        if (identity is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity or guest cart session is required."
            });
        }

        SetGuestSessionHeader(identity.SessionId);

        if (request.Quantity <= 0)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid quantity",
                Detail = "Quantity must be greater than zero."
            });
        }

        var cart = await GetCartWithItemsAsync(identity);

        if (cart is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity or guest cart session is required."
            });
        }

        var cartItem = cart.CartItems.FirstOrDefault(item => item.Id == cartItemId);

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

        var updatedCart = await GetCartWithItemsByIdAsync(cart.Id);

        return Ok(MapCart(updatedCart!));
    }

    [HttpDelete("{cartItemId:int}")]
    public async Task<ActionResult<CartDto>> RemoveCartItem(int cartItemId)
    {
        var identity = await ResolveCartIdentityAsync(allowCreateGuestSession: false);

        if (identity is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity or guest cart session is required."
            });
        }

        SetGuestSessionHeader(identity.SessionId);

        var cart = await GetCartWithItemsAsync(identity);

        if (cart is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity or guest cart session is required."
            });
        }

        var cartItem = cart.CartItems.FirstOrDefault(item => item.Id == cartItemId);

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

        var updatedCart = await GetCartWithItemsByIdAsync(cart.Id);

        if (updatedCart is null)
        {
            return Ok(new CartDto());
        }

        return Ok(MapCart(updatedCart));
    }

    [HttpDelete("clear")]
    public async Task<ActionResult<CartDto>> ClearCart()
    {
        var identity = await ResolveCartIdentityAsync(allowCreateGuestSession: false);

        if (identity is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity or guest cart session is required."
            });
        }

        SetGuestSessionHeader(identity.SessionId);

        var cart = await GetCartWithItemsAsync(identity);

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

    private async Task<CartIdentity?> ResolveCartIdentityAsync(bool allowCreateGuestSession)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrWhiteSpace(claimValue))
        {
            return new CartIdentity(claimValue, null);
        }

        var now = DateTime.UtcNow;
        var sessionId = Request.Headers[GuestSessionHeaderName].ToString();

        if (!string.IsNullOrWhiteSpace(sessionId))
        {
            var guestSession = await _context.GuestSessions
                .FirstOrDefaultAsync(item => item.SessionId == sessionId);

            if (guestSession is not null)
            {
                if (guestSession.ExpiresAtUtc <= now)
                {
                    _context.GuestSessions.Remove(guestSession);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    guestSession.ExpiresAtUtc = now.Add(GuestSessionTtl);
                    await _context.SaveChangesAsync();
                    return new CartIdentity(null, guestSession.SessionId);
                }
            }
        }

        if (!allowCreateGuestSession)
        {
            return null;
        }

        var createdGuestSession = await CreateGuestSessionAsync();
        return new CartIdentity(null, createdGuestSession.SessionId);
    }

    private async Task<Cart?> GetCartWithItemsAsync(CartIdentity identity)
    {
        if (!string.IsNullOrWhiteSpace(identity.UserId))
        {
            return await _context.Carts
                .Include(item => item.CartItems)
                .ThenInclude(item => item.Listing)
                .ThenInclude(item => item.Category)
                .FirstOrDefaultAsync(item => item.UserId == identity.UserId);
        }

        if (string.IsNullOrWhiteSpace(identity.SessionId))
        {
            return null;
        }

        var cartId = await _context.GuestSessions
            .Where(item => item.SessionId == identity.SessionId)
            .Select(item => (int?)item.CartId)
            .FirstOrDefaultAsync();

        if (!cartId.HasValue)
        {
            return null;
        }

        return await GetCartWithItemsByIdAsync(cartId.Value);
    }

    private Task<Cart?> GetCartWithItemsByIdAsync(int cartId)
    {
        return _context.Carts
            .Include(item => item.CartItems)
            .ThenInclude(item => item.Listing)
            .ThenInclude(item => item.Category)
            .FirstOrDefaultAsync(item => item.Id == cartId);
    }

    private async Task<Cart> GetOrCreateCartAsync(CartIdentity identity)
    {
        var cart = await GetCartWithItemsAsync(identity);

        if (cart is not null)
        {
            return cart;
        }

        if (!string.IsNullOrWhiteSpace(identity.UserId))
        {
            cart = new Cart
            {
                UserId = identity.UserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        if (string.IsNullOrWhiteSpace(identity.SessionId))
        {
            throw new InvalidOperationException("A valid guest cart session is required.");
        }

        var guestSession = await _context.GuestSessions
            .FirstOrDefaultAsync(item => item.SessionId == identity.SessionId);

        if (guestSession is null)
        {
            throw new InvalidOperationException("A valid guest cart session is required.");
        }

        cart = new Cart
        {
            UserId = BuildGuestUserId(identity.SessionId),
            CreatedAt = DateTime.UtcNow
        };

        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();

        guestSession.CartId = cart.Id;
        await _context.SaveChangesAsync();

        return cart;
    }

    private async Task<GuestSession> CreateGuestSessionAsync()
    {
        var sessionId = Guid.NewGuid().ToString("N");
        var now = DateTime.UtcNow;

        var cart = new Cart
        {
            UserId = BuildGuestUserId(sessionId),
            CreatedAt = now
        };

        var guestSession = new GuestSession
        {
            SessionId = sessionId,
            Cart = cart,
            CreatedAtUtc = now,
            ExpiresAtUtc = now.Add(GuestSessionTtl)
        };

        _context.GuestSessions.Add(guestSession);
        await _context.SaveChangesAsync();

        return guestSession;
    }

    private static string BuildGuestUserId(string sessionId)
    {
        return $"guest:{sessionId}";
    }

    private void SetGuestSessionHeader(string? sessionId)
    {
        if (!string.IsNullOrWhiteSpace(sessionId))
        {
            Response.Headers[GuestSessionHeaderName] = sessionId;
        }
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

    private sealed record CartIdentity(string? UserId, string? SessionId);
}
