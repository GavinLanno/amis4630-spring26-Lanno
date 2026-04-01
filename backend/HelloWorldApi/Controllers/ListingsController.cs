using HelloWorldApi.Data;
using HelloWorldApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Listing>> GetListings()
    {
        return Ok(ListingStore.Listings);
    }

    [HttpGet("{id:int}")]
    public ActionResult<Listing> GetListingById(int id)
    {
        var listing = ListingStore.Listings.FirstOrDefault(p => p.Id == id);  

        if (listing is null)
        {
            return NotFound(new { message = $"Listing with id {id} was not found." });
        }

        return Ok(listing);
    }
}