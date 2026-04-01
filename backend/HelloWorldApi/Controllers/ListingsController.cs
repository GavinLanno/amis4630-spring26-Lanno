// ListingsController.cs - Controller
// Handles HTTP requests for the Listings resource.
// Injects ListingContext via dependency injection to query the database.
// Maps Listing models to ListingDto before sending to the frontend.
// Endpoints: GET /api/listings, GET /api/listings/{id}

using HelloWorldApi.Data;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly ListingContext _db;

    public ListingsController(ListingContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ListingDto>>> GetListings()
    {
        var listings = await _db.Listings
            .Include(l => l.Category)
            .Select(l => new ListingDto
            {
                Id = l.Id,
                Address = l.Address,
                Description = l.Description,
                Price = l.Price,
                CategoryName = l.Category.Name,
                SellerName = l.SellerName,
                PostedDate = l.PostedDate,
                ImageURL = l.ImageURL
            })
            .ToListAsync();

        return Ok(listings);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ListingDto>> GetListingById(int id)
    {
        var listing = await _db.Listings
            .Include(l => l.Category)
            .Where(l => l.Id == id)
            .Select(l => new ListingDto
            {
                Id = l.Id,
                Address = l.Address,
                Description = l.Description,
                Price = l.Price,
                CategoryName = l.Category.Name,
                SellerName = l.SellerName,
                PostedDate = l.PostedDate,
                ImageURL = l.ImageURL
            })
            .FirstOrDefaultAsync();

        if (listing is null)
        {
            return NotFound(new { message = $"Listing with id {id} was not found." });
        }

        return Ok(listing);
    }
}