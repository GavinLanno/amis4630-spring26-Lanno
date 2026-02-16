var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();


// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Configure CORS to allow React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    // ⭐ ADD THESE LINEs
    app.UseSwaggerUI();
    
    //I had to delete some given code for it to work
}

app.UseHttpsRedirection();


//Enables cross-origin Resource Sharing
app.UseCors("AllowReact");

app.UseAuthorization();

app.MapControllers();

app.Run();
