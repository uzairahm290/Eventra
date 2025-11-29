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
// Applies migrations and seeds an admin user and sample data when running in Development.
static async Task SeedDevelopmentDataAsync(IServiceProvider services)
{
    var env = services.GetRequiredService<IHostEnvironment>();
    if (!env.IsDevelopment()) return;

    var db = services.GetRequiredService<AppDbContext>();
    // Apply any pending migrations
    await db.Database.MigrateAsync();

    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

    // Create a development admin user if not present
    var adminEmail = "dev@eventra.local";
    if (userManager.Users.All(u => u.Email != adminEmail))
    {
        var admin = new ApplicationUser
        {
            UserName = "devadmin",
            Email = adminEmail,
            FirstName = "Dev",
            SecondName = "Admin",
            DateRegistered = DateTime.UtcNow
        };

        // Password will be hashed by Identity
        await userManager.CreateAsync(admin, "Dev@12345!");
    }

    // Seed sample events if none exist
    if (!db.Events.Any())
    {
        db.Events.AddRange(
            new Event { Title = "Sample Meetup", Date = DateTime.UtcNow.AddDays(7), Location = "Main Hall", Description = "A sample meetup created for development.", MaxAttendees = 100 },
            new Event { Title = "Product Launch", Date = DateTime.UtcNow.AddDays(21), Location = "Auditorium", Description = "Product launch demo event.", MaxAttendees = 250 }
        );

        await db.SaveChangesAsync();
    }
}

// Run seeding synchronously during startup (only in development)
SeedDevelopmentDataAsync(app.Services).GetAwaiter().GetResult();

app.UseHttpsRedirection();
app.UseCors("AllowVite");

// IMPORTANT: UseAuthentication must come before UseAuthorization
app.UseAuthentication(); // This now uses your JWT setup
app.UseAuthorization();

app.MapControllers();

app.Run();