using HelloWorldApi.Data;
using HelloWorldApi.Middleware;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using HelloWorldApi.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var jwtSigningKey = builder.Configuration["JWT_SIGNING_KEY"];
var useInMemoryDatabase = builder.Configuration.GetValue<bool>("UseInMemoryDatabase");

if (string.IsNullOrWhiteSpace(jwtSigningKey))
{
    throw new InvalidOperationException(
        "Missing JWT signing key. Set JWT_SIGNING_KEY via User Secrets or environment variable.");
}

builder.Services.AddControllers();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});
builder.Services.AddScoped<IPasswordHasher<AuthUser>, PasswordHasher<AuthUser>>();
builder.Services.AddScoped<IPasswordHasher<RefreshToken>, PasswordHasher<RefreshToken>>();
builder.Services.AddScoped<FluentValidation.IValidator<RegisterRequestDto>, RegisterRequestValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<UpdateOrderStatusRequestDto>, UpdateOrderStatusValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<CreateListingRequestDto>, CreateListingRequestValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<UpdateListingRequestDto>, UpdateListingRequestValidator>();


// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var corsOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddDbContext<ListingContext>(opt =>
{
    if (useInMemoryDatabase)
    {
        opt.UseInMemoryDatabase("hello-world-api-tests");
        return;
    }

    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ListingContext>();

    if (useInMemoryDatabase)
    {
        db.Database.EnsureCreated();
    }
    else
    {
        db.Database.Migrate();
    }

    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AuthUser>>();
    var adminUserId = builder.Configuration["ADMIN_SEED_USER_ID"] ?? "admin";
    var adminEmail = builder.Configuration["ADMIN_SEED_EMAIL"] ?? "admin@buckeye.local";
    var adminPassword = builder.Configuration["ADMIN_SEED_PASSWORD"] ?? "AdminPass1";

    var adminAlreadyExists = db.AuthUsers.Any(user => user.UserId == adminUserId || user.Email == adminEmail);

    if (!adminAlreadyExists)
    {
        var adminUser = new AuthUser
        {
            UserId = adminUserId,
            Email = adminEmail,
            Role = "Admin"
        };

        adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, adminPassword);

        db.AuthUsers.Add(adminUser);

        try
        {
            db.SaveChanges();
        }
        catch (DbUpdateException)
        {
            var seedCompletedByAnotherProcess = db.AuthUsers.Any(user =>
                user.UserId == adminUserId || user.Email == adminEmail);

            if (!seedCompletedByAnotherProcess)
            {
                throw;
            }
        }
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    // ⭐ ADD THESE LINEs
    app.UseSwaggerUI();
    
    //I had to delete some given code for it to work
}

app.UseExceptionHandler();
app.UseStaticFiles();

app.UseHttpsRedirection();


//Enables cross-origin Resource Sharing
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
