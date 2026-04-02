using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HelloWorldApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialSqlite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Carts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Listings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Address = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    SellerName = table.Column<string>(type: "TEXT", nullable: false),
                    PostedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ImageURL = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Listings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Listings_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CartId = table.Column<int>(type: "INTEGER", nullable: false),
                    ListingId = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartItems_Carts_CartId",
                        column: x => x.CartId,
                        principalTable: "Carts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartItems_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartItems_Listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "Listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "House" },
                    { 2, "Condo" },
                    { 3, "Townhouse" },
                    { 4, "Luxury" },
                    { 5, "Apartment" }
                });

            migrationBuilder.InsertData(
                table: "Listings",
                columns: new[] { "Id", "Address", "CategoryId", "Description", "ImageURL", "PostedDate", "Price", "SellerName" },
                values: new object[,]
                {
                    { 1, "142 Oakwood Drive, Austin, TX 78701", 1, "Charming 3-bedroom ranch-style home with an open floor plan, updated kitchen, and a spacious backyard. Perfect for families.", "/images/listings/austin-ranch.jpeg", new DateTime(2025, 1, 8, 0, 0, 0, 0, DateTimeKind.Utc), 324900m, "James Carter" },
                    { 2, "87 Maple Street, Denver, CO 80203", 2, "Modern 2-bedroom condo in the heart of downtown Denver. Features floor-to-ceiling windows, granite countertops, and a rooftop terrace.", "/images/listings/denver-condo.jpg", new DateTime(2025, 1, 22, 0, 0, 0, 0, DateTimeKind.Utc), 415000m, "Rachel Thompson" },
                    { 3, "305 Lakeview Blvd, Orlando, FL 32801", 1, "Stunning 4-bedroom lakefront property with a private dock, screened-in pool, and breathtaking sunset views over Lake Monroe.", "/images/listings/orlando-lakefront.jpg", new DateTime(2025, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), 589000m, "David Nguyen" },
                    { 4, "19 Birchwood Lane, Nashville, TN 37201", 3, "Newly built 3-bedroom townhouse in a quiet suburban neighborhood. Open-concept living area, two-car garage, and energy-efficient appliances.", "/images/listings/nashville-townhouse.jpg", new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 372500m, "Monica Harris" },
                    { 5, "560 Sunset Avenue, Phoenix, AZ 85001", 4, "Elegant 5-bedroom luxury home with a resort-style pool, outdoor kitchen, and mountain views. Located in a gated community.", "/images/listings/phoenix-luxury.jpg", new DateTime(2025, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8750000m, "Steven Alvarez" },
                    { 6, "233 Elm Court, Charlotte, NC 28201", 1, "Cozy 2-bedroom starter home with a newly renovated bathroom, hardwood floors throughout, and a large front porch.", "/images/listings/charlotte-starter.jpg", new DateTime(2025, 3, 12, 0, 0, 0, 0, DateTimeKind.Utc), 218000m, "Angela Foster" },
                    { 7, "48 River Run Road, Portland, OR 97201", 5, "Charming studio apartment steps from the Willamette River. Features exposed brick walls, updated fixtures, and in-unit laundry.", "/images/listings/portland-studio.jpg", new DateTime(2025, 3, 28, 0, 0, 0, 0, DateTimeKind.Utc), 189000m, "Brian Okafor" },
                    { 8, "791 Pinecrest Way, Atlanta, GA 30301", 1, "Spacious 4-bedroom colonial home on a half-acre lot. Features a finished basement, chef's kitchen, and a large wraparound deck.", "/images/listings/atlanta-colonial.jpg", new DateTime(2025, 4, 10, 0, 0, 0, 0, DateTimeKind.Utc), 495000m, "Karen Mitchell" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CategoryId",
                table: "CartItems",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_ListingId",
                table: "CartItems",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_CategoryId",
                table: "Listings",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "Carts");

            migrationBuilder.DropTable(
                name: "Listings");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
