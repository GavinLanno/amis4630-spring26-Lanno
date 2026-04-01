# AGENTS.md

Guidelines for AI coding agents working in this .NET Web API repository.

---

## Stack

| Layer      | Tool                                          |
| ---------- | --------------------------------------------- |
| Framework  | ASP.NET Core (.NET 10)                        |
| Language   | C# 14                                         |
| ORM        | Entity Framework Core (InMemory → SQL Server) |
| API Style  | Controller-based (attribute routing)          |
| Docs       | OpenAPI (Swashbuckle) + Swagger UI            |
| Validation | Data Annotations + ProblemDetails             |
| Testing    | None (course scope)                           |

---

## Project Structure

```
HelloWorldApi/
├── Controllers/           # API controllers (one per aggregate/entity)
│   ├── CartController.cs
│   └── ListingsController.cs
├── Data/                  # DbContext and seed data
│   └── LisitngContext.cs
├── wwwroot/images/listings # Holds images for listings
│   ├── individual photo files
├── DTOs/                  # Request/response records
│   ├── AddToCartDto.cs
│   ├── CartDto.cs
│   ├── CartItemDtos.cs
│   ├── ListingDto.cs
│   └── UpdateCartItemsDtos.cs
├── Middleware/             # Cross-cutting concerns
│   └── GlobalExceptionHandler.cs
├── Models/                # EF Core entity classes
│   ├── Cart.cs
│   ├── CartItem.cs
│   ├── Category.cs
│   └── Listing.cs
├── Program.cs             # Service registration and middleware pipeline
├── appsettings.json
└── HelloWorldApi.csproj

```


### Rules

- One controller per entity or aggregate root.
- Models in `Models/` are EF Core entities — they map to database tables.
- DTOs in `DTOs/` are API contracts — they define what the client sends and receives.
- Never expose entity models directly on API endpoints. Always map to/from DTOs.
- Co-locate seed data in `Data/` alongside the DbContext (use `OnModelCreating` + `HasData`).
- Use file-scoped namespaces: `namespace ProjectName.Controllers;`

---


## Package Management

- **Always** use `dotnet add package <PackageName>` to install packages.
- **Never** edit `.csproj` files directly.
- Use the latest stable version of all packages.
- When adding EF Core packages, ensure all EF Core packages share the same version.

---

## DTOs — Records, Not Classes

All DTOs are C# `record` types. Records give you value equality, immutability, and concise syntax — ideal for data transfer objects that carry values but have no behavior.


### Request DTOs (what the client sends)

```csharp
public record CreateListingRequest(
    [Required, MaxLength(200)] string Name,
    [Required, MaxLength(2000)] string Description,
    [Required, Range(0.01, 99999999.99)] decimal Price,
    [Required] int CategoryId,
    [Url] string? ImageUrl
);

public record UpdateListingRequest(
    [Required, MaxLength(200)] string Name,
    [Required, MaxLength(2000)] string Description,
    [Required, Range(0.01, 999999.99)] decimal Price,
    [Required] int CategoryId,
    [Url] string? ImageUrl
);

public record UpdateQuantityRequest(
    [Required, Range(1, 9999)] int Quantity
);
```

### Response DTOs (what the client receives)

```csharp
public record ListingResponse(
    int Id,
    string Name,
    string Description,
    decimal Price,
    string CategoryName,
    string? ImageUrl
);
```


### Rules

- Request DTOs carry **validation attributes** directly on positional parameters.
- Response DTOs are **plain records** — no validation attributes.
- Never reuse the same DTO for both request and response.
- Separate `Create` and `Update` request DTOs even if they look similar — they evolve independently.
- Use `decimal` for currency values. Never `double` or `float`.
- Use nullable types (`string?`, `int?`) for optional fields.

---




## Entity Models

Entity models are standard C# classes with mutable properties — EF Core needs `{ get; set; }` for change tracking.

```csharp
public class Listing
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "decimal(12,2)")]
    public decimal Price { get; set; }

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

### Rules

- Initialize strings with `string.Empty`, not `""` or `null`.
- Navigation properties use `null!` (null-forgiving) since EF Core manages their lifecycle.
- Always store dates as `DateTime.UtcNow`. Never `DateTime.Now`.
- Use `[Column(TypeName = "decimal(12,2)")]` on all currency properties.
- Include `[Required]` and `[MaxLength]` on entity properties — these drive both database constraints and auto-validation.

---

## Controllers

### Anatomy

```csharp
[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly MarketplaceContext _context;

    public ListingsController(MarketplaceContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ListingResponse>>> GetAll(
        [FromQuery] string? category,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice)
    {
        var query = _context.Listings
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category.Name == category);

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        var Listings = await query.ToListAsync();

        return Ok(Listings.Select(p => new ListingResponse(
            p.Id,
            p.Name,
            p.Description,
            p.Price,
            p.Category.Name,
            p.ImageUrl
        )));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ListingResponse>> GetById(int id)
    {
        var Listing = await _context.Listings
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (Listing is null)
            return NotFound();

        return Ok(new ListingResponse(
            Listing.Id,
            Listing.Name,
            Listing.Description,
            Listing.Price,
            Listing.Category.Name,
            Listing.ImageUrl
        ));
    }

    [HttpPost]
    public async Task<ActionResult<ListingResponse>> Create(CreateListingRequest request)
    {
        var category = await _context.Categories.FindAsync(request.CategoryId);
        if (category is null)
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid category",
                Detail = $"Category with ID {request.CategoryId} does not exist."
            });

        var Listing = new Listing
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId,
            ImageUrl = request.ImageUrl
        };

        _context.Listings.Add(Listing);
        await _context.SaveChangesAsync();

        var response = new ListingResponse(
            Listing.Id,
            Listing.Name,
            Listing.Description,
            Listing.Price,
            category.Name,
            Listing.ImageUrl
        );

        return CreatedAtAction(nameof(GetById), new { id = Listing.Id }, response);
    }
}
```

### Rules

- Inherit from `ControllerBase` (not `Controller` — we don't use views).
- Always apply `[ApiController]` — this enables automatic model validation and `ProblemDetails` responses.
- Use `[Route("api/[controller]")]` for route prefix.
- Constructor injection only. Prefix private fields with underscore: `_context`.
- Use `readonly` for all injected dependencies.
- All data access methods must be `async` with `Task<ActionResult<T>>` return types.
- Use `async`/`await` with `ToListAsync()`, `FindAsync()`, `FirstOrDefaultAsync()`, `SaveChangesAsync()`. No blocking calls.
- Use `AsQueryable()` for composable query building with conditional filters.
- Validate business rules (cross-field, referential integrity) before querying data. Return `BadRequest(new ProblemDetails { ... })` on failure.
- Return `CreatedAtAction` for POST (201), `Ok` for GET (200), `NoContent` for PUT/DELETE (204), `NotFound` for missing resources (404).
- Map entity → response DTO before returning. Never return entity models directly.

---

## Validation

### Three layers

| Layer                              | What it catches                                 | Who handles it                                           |
| ---------------------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| Data Annotations on DTOs           | Missing fields, range violations, format errors | `[ApiController]` auto-returns 400 + ProblemDetails      |
| Business rule guards in controller | Cross-field logic, referential integrity        | Explicit `return BadRequest(new ProblemDetails { ... })` |
| Global exception handler           | Unhandled exceptions                            | `IExceptionHandler` middleware catches and formats       |

### Rules

- All validation errors return `ProblemDetails` (RFC 7807).
- Never throw exceptions for expected validation failures. Use `return BadRequest(...)`.
- Validate request guards **before** touching the database.
- Data annotations on DTO positional parameters validate automatically — no manual checking needed for simple constraints.

---

## Global Exception Handler

Every project must have a `GlobalExceptionHandler` in `Middleware/`.

```csharp
using Microsoft.AspNetCore.Diagnostics;

namespace ProjectName.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        var problemDetails = exception switch
        {
            KeyNotFoundException => new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = exception.Message
            },
            ArgumentException => new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid request",
                Detail = exception.Message
            },
            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "An unexpected error occurred",
                Type = "https://tools.ietf.org/html/rfc7807"
            }
        };

        httpContext.Response.StatusCode = problemDetails.Status!.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
```

### Rules

- Always log the exception server-side before returning the response.
- Never expose stack traces or internal details in the `ProblemDetails` response.
- The `500` case uses a generic message — never leak implementation details.
- Use structured logging: `_logger.LogError(exception, "...", ...)` — not string interpolation.

---

## Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// --- Services ---

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<MarketplaceContext>(options =>
    options.UseInMemoryDatabase("BuckeyeMarketplace"));

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// --- Middleware Pipeline (order matters) ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.MapControllers();

// --- Seed Data ---

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MarketplaceContext>();
    context.Database.EnsureCreated();
}

app.Run();
```

### Pipeline order

1. Swagger (development only)
2. `UseExceptionHandler()` — catches unhandled exceptions before anything else
3. `UseHttpsRedirection()`
4. `UseCors()` — must come before `MapControllers()`
5. `MapControllers()` — always last

### Rules

- Always register `AddEndpointsApiExplorer()` and `AddSwaggerGen()` — every API must have OpenAPI docs.
- Always enable Swagger UI in development: `UseSwagger()` + `UseSwaggerUI()`.
- Register `AddExceptionHandler<T>()` and `AddProblemDetails()` together.
- CORS must allow `http://localhost:5173` (React dev server).
- Seed data runs on startup via `EnsureCreated()` — not migrations (InMemory provider).
- No minimal API endpoints. All routes go through controllers.

---

## EF Core

### DbContext

```csharp
public class MarketplaceContext : DbContext
{
    public MarketplaceContext(DbContextOptions<MarketplaceContext> options)
        : base(options) { }

    public DbSet<Listing> Listings { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Electronics" },
            new Category { Id = 2, Name = "Books" }
        );

        modelBuilder.Entity<Listing>().HasData(
            new Listing { Id = 1, Name = "Laptop", Price = 999.99m, CategoryId = 1 }
        );
    }
}
```

### Rules

- Accept `DbContextOptions<T>` in constructor, pass to base.
- One `DbSet<T>` per entity.
- Seed data in `OnModelCreating` with `HasData()` — requires explicit `Id` values.
- Relationships are configured via navigation properties + foreign key properties on the entity.
- Use `Include()` for eager loading related entities. Never rely on lazy loading.
- Use `AsQueryable()` to build composable queries with conditional `.Where()` clauses.
- Execute queries with `ToListAsync()`, `FirstOrDefaultAsync()`, `FindAsync()` — always async.

---

## C# Conventions

### Naming

| Element                      | Style        | Example                              |
| ---------------------------- | ------------ | ------------------------------------ |
| Classes, Records, Interfaces | PascalCase   | `ListingResponse`, `IListingService` |
| Properties                   | PascalCase   | `ApplicantName`, `LoanType`          |
| Methods                      | PascalCase   | `GetAll()`, `CreateListing()`        |
| Parameters, local variables  | camelCase    | `minPrice`, `categoryId`             |
| Private fields               | `_camelCase` | `_context`, `_logger`                |
| Constants                    | PascalCase   | `MaxPageSize`, `DefaultCurrency`     |

### Style

- File-scoped namespaces: `namespace ProjectName.Controllers;` (no braces).
- `var` for local variables when the type is obvious from the right-hand side.
- Pattern matching with `is`: `if (Listing is null)` instead of `== null`.
- Switch expressions for mapping: `exception switch { KeyNotFoundException => ..., _ => ... }`.
- Primary constructors on records (positional parameters).
- `string.Empty` over `""` for initialization.
- `decimal` for money. Never `double`.
- `DateTime.UtcNow` for timestamps. Never `DateTime.Now`.

---

## OpenAPI / Swagger

- Every project must include `AddEndpointsApiExplorer()` and `AddSwaggerGen()` in Program.cs.
- Swagger UI must be enabled in development via `UseSwagger()` + `UseSwaggerUI()`.
- Controllers should return typed `ActionResult<T>` so Swagger generates accurate response schemas.
- Use `[ProducesResponseType]` when a method returns multiple status codes:

```csharp
[HttpGet("{id}")]
[ProducesResponseType(typeof(ListingResponse), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<ListingResponse>> GetById(int id) { ... }
```

---

## Do Nots

- Do not edit `.csproj` directly. Use `dotnet add package`.
- Do not expose entity models on API endpoints. Always use DTOs.
- Do not use `DateTime.Now`. Use `DateTime.UtcNow`.
- Do not use `double` or `float` for currency. Use `decimal`.
- Do not use lazy loading. Use `Include()` for related data.
- Do not use minimal API endpoints. Use controller-based routing.
- Do not swallow exceptions. Log them, then return `ProblemDetails`.
- Do not return raw exception messages to the client in production.
- Do not use blocking EF Core calls (`ToList()`, `Find()`). Use async variants.
- Do not put business logic in controllers beyond validation guards — extract to services as complexity grows.