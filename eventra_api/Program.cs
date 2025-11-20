using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Allow requests from Vite (localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add controllers
builder.Services.AddControllers();

var app = builder.Build();

// Use CORS
app.UseCors("AllowVite");

// Map controllers
app.MapControllers();

// Simple Welcome Text API (Minimal API)
app.MapGet("/api/welcome", () =>
{
    return Results.Ok("Welcome to my ASP.NET API!");
});

app.Run();
