using HelloWorldApi.Models;

namespace HelloWorldApi.Data;

public static class ListingStore
{
    public static readonly List<Listing> Listings =
[
    new() { Id = 1, Address = "142 Oakwood Drive, Austin, TX 78701", Description = "Charming 3-bedroom ranch-style home with an open floor plan, updated kitchen, and a spacious backyard. Perfect for families.", Price = 324900m, Category = "House", SellerName = "James Carter", PostedDate = new DateTime(2025, 1, 8), ImageURL = "/images/listings/austin-ranch.jpeg" },
    new() { Id = 2, Address = "87 Maple Street, Denver, CO 80203", Description = "Modern 2-bedroom condo in the heart of downtown Denver. Features floor-to-ceiling windows, granite countertops, and a rooftop terrace.", Price = 415000m, Category = "Condo", SellerName = "Rachel Thompson", PostedDate = new DateTime(2025, 1, 22), ImageURL = "/images/listings/denver-condo.jpg" },
    new() { Id = 3, Address = "305 Lakeview Blvd, Orlando, FL 32801", Description = "Stunning 4-bedroom lakefront property with a private dock, screened-in pool, and breathtaking sunset views over Lake Monroe.", Price = 589000m, Category = "House", SellerName = "David Nguyen", PostedDate = new DateTime(2025, 2, 5), ImageURL = "/images/listings/orlando-lakefront.jpg" },
    new() { Id = 4, Address = "19 Birchwood Lane, Nashville, TN 37201", Description = "Newly built 3-bedroom townhouse in a quiet suburban neighborhood. Open-concept living area, two-car garage, and energy-efficient appliances.", Price = 372500m, Category = "Townhouse", SellerName = "Monica Harris", PostedDate = new DateTime(2025, 2, 17), ImageURL = "/images/listings/nashville-townhouse.jpg" },
    new() { Id = 5, Address = "560 Sunset Avenue, Phoenix, AZ 85001", Description = "Elegant 5-bedroom luxury home with a resort-style pool, outdoor kitchen, and mountain views. Located in a gated community.", Price = 8750000m, Category = "Luxury", SellerName = "Steven Alvarez", PostedDate = new DateTime(2025, 3, 1), ImageURL = "/images/listings/phoenix-luxury.jpg" },
    new() { Id = 6, Address = "233 Elm Court, Charlotte, NC 28201", Description = "Cozy 2-bedroom starter home with a newly renovated bathroom, hardwood floors throughout, and a large front porch.", Price = 218000m, Category = "House", SellerName = "Angela Foster", PostedDate = new DateTime(2025, 3, 12), ImageURL = "/images/listings/charlotte-starter.jpg" },
    new() { Id = 7, Address = "48 River Run Road, Portland, OR 97201", Description = "Charming studio apartment steps from the Willamette River. Features exposed brick walls, updated fixtures, and in-unit laundry.", Price = 189000m, Category = "Apartment", SellerName = "Brian Okafor", PostedDate = new DateTime(2025, 3, 28), ImageURL = "/images/listings/portland-studio.jpg" },
    new() { Id = 8, Address = "791 Pinecrest Way, Atlanta, GA 30301", Description = "Spacious 4-bedroom colonial home on a half-acre lot. Features a finished basement, chef's kitchen, and a large wraparound deck.", Price = 495000m, Category = "House", SellerName = "Karen Mitchell", PostedDate = new DateTime(2025, 4, 10), ImageURL = "/images/listings/atlanta-colonial.jpg" }
];
}
