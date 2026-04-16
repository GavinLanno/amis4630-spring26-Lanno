// ListingContext.cs - EF Core DbContext
// The main database context for the application.
// Registers all tables (Listings, Categories, Carts, CartItems) as DbSets for EF Core.
// Seeds initial Category and Listing data via OnModelCreating.
// Injected into controllers via dependency injection — configured in Program.cs.

using HelloWorldApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HelloWorldApi.Data;

public class ListingContext : DbContext
{
    public ListingContext(DbContextOptions<ListingContext> options)
        : base(options) { }

    public DbSet<Listing> Listings { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<GuestSession> GuestSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GuestSession>()
            .HasIndex(item => item.SessionId)
            .IsUnique();

        modelBuilder.Entity<GuestSession>()
            .HasOne(item => item.Cart)
            .WithMany()
            .HasForeignKey(item => item.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "House" },
            new Category { Id = 2, Name = "Condo" },
            new Category { Id = 3, Name = "Townhouse" },
            new Category { Id = 4, Name = "Luxury" },
            new Category { Id = 5, Name = "Apartment" }
        );

        modelBuilder.Entity<Listing>().HasData(
            new Listing
            {
                Id = 1,
                Address = "142 Oakwood Drive, Austin, TX 78701",
                Description = "Charming 3-bedroom ranch-style home with an open floor plan, updated kitchen, and a spacious backyard. Perfect for families.",
                Price = 324900m,
                CategoryId = 1,
                SellerName = "James Carter",
                PostedDate = new DateTime(2025, 1, 8, 0, 0, 0, DateTimeKind.Utc),
                ImageURL = "/images/listings/austin-ranch.jpeg"
            },
            new Listing
            {
                Id = 2,
                Address = "87 Maple Street, Denver, CO 80203",
                Description = "Modern 2-bedroom condo in the heart of downtown Denver. Features floor-to-ceiling windows, granite countertops, and a rooftop terrace.",
                Price = 415000m,
                CategoryId = 2,
                SellerName = "Rachel Thompson",
                PostedDate = new DateTime(2025, 1, 22, 0, 0, 0, DateTimeKind.Utc),
                ImageURL = "/images/listings/denver-condo.jpg"
            },
            new Listing
            {
                Id = 3,
                Address = "305 Lakeview Blvd, Orlando, FL 32801",
                Description = "Stunning 4-bedroom lakefront property with a private dock, screened-in pool, and breathtaking sunset views over Lake Monroe.",
                Price = 589000m,
                CategoryId = 1,
                SellerName = "David Nguyen",
                PostedDate = new DateTime(2025, 2, 5, 0, 0, 0, DateTimeKind.Utc),
                ImageURL = "/images/listings/orlando-lakefront.jpg"
            },
            new Listing
            {
                Id = 4,
                Address = "19 Birchwood Lane, Nashville, TN 37201",
                Description = "Newly built 3-bedroom townhouse in a quiet suburban neighborhood. Open-concept living area, two-car garage, and energy-efficient appliances.",
                Price = 372500m,
                CategoryId = 3,
                SellerName = "Monica Harris",
                PostedDate = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc),
                ImageURL = "/images/listings/nashville-townhouse.jpg"
            },
            new Listing
            {
                Id = 5,
                Address = "560 Sunset Avenue, Phoenix, AZ 85001",
                Description = "Elegant 5-bedroom luxury home with a resort-style pool, outdoor kitchen, and mountain views. Located in a gated community.",
                Price = 8750000m,
                CategoryId = 4,
                SellerName = "Steven Alvarez",
                PostedDate = new DateTime(2025, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                ImageURL = "/images/listings/phoenix-luxury.jpg"
            },
            new Listing
            {
                Id = 6,
                Address = "233 Elm Court, Charlotte, NC 28201",
                Description = "Cozy 2-bedroom starter home with a newly renovated bathroom, hardwood floors throughout, and a large front porch.",
                Price = 218000m,
                CategoryId = 1,
                SellerName = "Angela Foster",
                PostedDate = new DateTime(2025, 3, 12, 0, 0, 0, DateTimeKind.Utc),
                ImageURL = "/images/listings/charlotte-starter.jpg"
            },
            new Listing
            {
                Id = 7,
                Address = "48 River Run Road, Portland, OR 97201",
                Description = "Charming studio apartment steps from the Willamette River. Features exposed brick walls, updated fixtures, and in-unit laundry.",
                Price = 189000m,
                CategoryId = 5,
                SellerName = "Brian Okafor",
                PostedDate = new DateTime(2025, 3, 28, 0, 0, 0, DateTimeKind.Utc),
                ImageURL = "/images/listings/portland-studio.jpg"
            },
            new Listing
            {
                Id = 8,
                Address = "791 Pinecrest Way, Atlanta, GA 30301",
                Description = "Spacious 4-bedroom colonial home on a half-acre lot. Features a finished basement, chef's kitchen, and a large wraparound deck.",
                Price = 495000m,
                CategoryId = 1,
                SellerName = "Karen Mitchell",
                PostedDate = new DateTime(2025, 4, 10, 0, 0, 0, DateTimeKind.Utc),
                ImageURL = "/images/listings/atlanta-colonial.jpg"
            }
        );
    }
}