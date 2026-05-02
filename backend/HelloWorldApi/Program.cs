using HelloWorldApi.Data;
using HelloWorldApi.Middleware;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using HelloWorldApi.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.FileProviders;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
using var startupLoggerFactory = LoggerFactory.Create(logging => logging.AddSimpleConsole());
var startupLogger = startupLoggerFactory.CreateLogger("Startup");

// Add services to the container.

var jwtSigningKey = builder.Configuration["JWT_SIGNING_KEY"];
var useInMemoryDatabase = builder.Configuration.GetValue<bool>("UseInMemoryDatabase");

if (string.IsNullOrWhiteSpace(jwtSigningKey))
{
    startupLogger.LogCritical("Application startup failed: JWT_SIGNING_KEY is missing.");
    throw new InvalidOperationException(
        "Missing JWT signing key. Set JWT_SIGNING_KEY via User Secrets or environment variable.");
}

builder.Services.AddControllers();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

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

var defaultCorsOrigins = string.Join(',',
    "http://localhost:5173",
    "https://agreeable-cliff-0d1ba470f.7.azurestaticapps.net");

var corsOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? defaultCorsOrigins)
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

app.Logger.LogInformation(
    "Application starting. Environment={Environment}; UseInMemoryDatabase={UseInMemoryDatabase}; CorsOrigins={CorsOrigins}",
    app.Environment.EnvironmentName,
    useInMemoryDatabase,
    string.Join(",", corsOrigins));

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ListingContext>();

        if (useInMemoryDatabase)
        {
            db.Database.EnsureCreated();
            app.Logger.LogInformation("In-memory database created successfully.");
        }
        else
        {
            db.Database.Migrate();
            app.Logger.LogInformation("Database migrations applied successfully.");
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
                app.Logger.LogInformation("Admin seed user created successfully.");
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
    catch (Exception exception)
    {
        app.Logger.LogCritical(exception, "Application startup failed during database initialization or seed.");
        throw;
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
app.UseForwardedHeaders();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "images")),
    RequestPath = "/images"
});


//Enables cross-origin Resource Sharing
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new { status = "Healthy" }));
app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));

app.MapControllers();

app.Run();

public partial class Program { }
