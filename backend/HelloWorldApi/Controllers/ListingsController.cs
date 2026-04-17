// ListingsController.cs - Controller
// Handles HTTP requests for the Listings resource.
// Injects ListingContext via dependency injection to query the database.
// Maps Listing models to ListingDto before sending to the frontend.
// Endpoints: GET /api/listings, GET /api/listings/{id}

using HelloWorldApi.Data;
using HelloWorldApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly ListingContext _context;

    public ListingsController(ListingContext context)
    {
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ListingDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ListingDto>>> GetListings()
    {
        var listings = await _context.Listings
            .Where(l => l.IsActive)
            .Include(l => l.Category)
            .Select(l => new ListingDto(
                l.Id,
                l.Address,
                l.Description,
                l.Price,
                l.Category.Name,
                l.SellerName,
                l.PostedDate,
                l.ImageURL
            ))
            .ToListAsync();

        return Ok(listings);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ListingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ListingDto>> GetListingById(int id)
    {
        var listing = await _context.Listings
            .Where(l => l.IsActive)
            .Include(l => l.Category)
            .Where(l => l.Id == id)
            .Select(l => new ListingDto(
                l.Id,
                l.Address,
                l.Description,
                l.Price,
                l.Category.Name,
                l.SellerName,
                l.PostedDate,
                l.ImageURL
            ))
            .FirstOrDefaultAsync();

        if (listing is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Listing not found",
                Detail = $"Listing with ID {id} was not found."
            });
        }

        return Ok(listing);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(ListingDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ListingDto>> CreateListing(CreateListingRequestDto request)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(item => item.Id == request.CategoryId);

        if (category is null)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid category",
                Detail = $"Category with ID {request.CategoryId} does not exist."
            });
        }

        var listing = new Models.Listing
        {
            Address = request.Address,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId,
            SellerName = request.SellerName,
            PostedDate = DateTime.UtcNow,
            ImageURL = request.ImageURL ?? string.Empty,
            IsActive = true
        };

        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();

        var response = new ListingDto(
            listing.Id,
            listing.Address,
            listing.Description,
            listing.Price,
            category.Name,
            listing.SellerName,
            listing.PostedDate,
            listing.ImageURL);

        return CreatedAtAction(nameof(GetListingById), new { id = listing.Id }, response);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(ListingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ListingDto>> UpdateListing(int id, UpdateListingRequestDto request)
    {
        var listing = await _context.Listings
            .FirstOrDefaultAsync(item => item.Id == id && item.IsActive);

        if (listing is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Listing not found",
                Detail = $"Listing with ID {id} was not found."
            });
        }

        var category = await _context.Categories
            .FirstOrDefaultAsync(item => item.Id == request.CategoryId);

        if (category is null)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid category",
                Detail = $"Category with ID {request.CategoryId} does not exist."
            });
        }

        listing.Address = request.Address;
        listing.Description = request.Description;
        listing.Price = request.Price;
        listing.CategoryId = request.CategoryId;
        listing.SellerName = request.SellerName;
        listing.ImageURL = request.ImageURL ?? string.Empty;

        await _context.SaveChangesAsync();

        var response = new ListingDto(
            listing.Id,
            listing.Address,
            listing.Description,
            listing.Price,
            category.Name,
            listing.SellerName,
            listing.PostedDate,
            listing.ImageURL);

        return Ok(response);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteListing(int id)
    {
        var listing = await _context.Listings
            .FirstOrDefaultAsync(item => item.Id == id && item.IsActive);

        if (listing is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Listing not found",
                Detail = $"Listing with ID {id} was not found."
            });
        }

        listing.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
