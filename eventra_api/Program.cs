using eventra_api.Data;
using eventra_api.Models;
using eventra_api.Services; // <-- 1. NEW: Required for TokenService
using Microsoft.AspNetCore.Authentication.JwtBearer; // <-- NEW: Required for JWT
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // <-- NEW: Required for TokenValidationParameters
using System.Text; // <-- NEW: Required for Encoding.UTF8.GetBytes
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------------------------------
// 1. SERVICES CONFIGURATION (builder.Services)
// ----------------------------------------------------

// Add DbContext for database connection (Entity Framework Core)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// NEW: Add and Configure ASP.NET Core Identity Services
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Configure password complexity rules 
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// 2. NEW: Register the Token Service
builder.Services.AddScoped<TokenService>(); // <-- REGISTER TOKEN SERVICE

// 3. NEW: Add and Configure JWT Bearer Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});


// Add services for Controllers
builder.Services.AddControllers();

// Add services for Swagger/OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Allow requests from Vite (localhost:5173) - (Your existing CORS policy)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


// ----------------------------------------------------
// 2. MIDDLEWARE CONFIGURATION (app)
// ----------------------------------------------------

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// -------------------------
// Development database seeding
// -------------------------
// Applies migrations and seeds sample data when running in Development.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    try
    {
        await DataSeeder.SeedDataAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowVite");

// IMPORTANT: UseAuthentication must come before UseAuthorization
app.UseAuthentication(); // This now uses your JWT setup
app.UseAuthorization();

app.MapControllers();

app.Run();