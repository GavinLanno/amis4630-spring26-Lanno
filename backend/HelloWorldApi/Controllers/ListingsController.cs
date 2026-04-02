// ListingsController.cs - Controller
// Handles HTTP requests for the Listings resource.
// Injects ListingContext via dependency injection to query the database.
// Maps Listing models to ListingDto before sending to the frontend.
// Endpoints: GET /api/listings, GET /api/listings/{id}

using HelloWorldApi.Data;
using HelloWorldApi.DTOs;
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
}
