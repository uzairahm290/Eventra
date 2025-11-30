using eventra_api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace eventra_api.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDataAsync(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<AppDbContext>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            // Apply migrations
            await context.Database.MigrateAsync();

            // Seed Users
            var admin = await SeedUsersAsync(userManager);

            // Seed Venues
            await SeedVenuesAsync(context);

            // Seed Events
            await SeedEventsAsync(context, admin);

            // Seed Menus
            await SeedMenusAsync(context);
        }

        private static async Task<ApplicationUser> SeedUsersAsync(UserManager<ApplicationUser> userManager)
        {
            // Seed Admin User
            var adminEmail = "dev@eventra.local";
            ApplicationUser? admin = await userManager.FindByEmailAsync(adminEmail);
            
            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    UserName = "devadmin",
                    Email = adminEmail,
                    FirstName = "Dev",
                    SecondName = "Admin",
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true
                };
                await userManager.CreateAsync(admin, "Dev@12345!");
            }

            // Seed Sample Users
            if (userManager.Users.Count() < 3)
            {
                var user1 = new ApplicationUser
                {
                    UserName = "john.doe",
                    Email = "john.doe@example.com",
                    FirstName = "John",
                    SecondName = "Doe",
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true
                };
                await userManager.CreateAsync(user1, "User@12345!");

                var user2 = new ApplicationUser
                {
                    UserName = "jane.smith",
                    Email = "jane.smith@example.com",
                    FirstName = "Jane",
                    SecondName = "Smith",
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true
                };
                await userManager.CreateAsync(user2, "User@12345!");
            }

            return admin;
        }

        private static async Task SeedVenuesAsync(AppDbContext context)
        {
            if (await context.Venues.AnyAsync())
                return;

            var venues = new List<Venue>
            {
                new Venue
                {
                    Name = "Grand Conference Center",
                    Address = "123 Main Street",
                    City = "New York",
                    State = "NY",
                    PostalCode = "10001",
                    Capacity = 500,
                    Description = "Modern conference center with state-of-the-art facilities",
                    ContactPhone = "+1-555-0100",
                    ContactEmail = "info@grandconference.com",
                    PricePerHour = 250.00m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Venue
                {
                    Name = "Downtown Event Space",
                    Address = "456 Oak Avenue",
                    City = "Los Angeles",
                    State = "CA",
                    PostalCode = "90001",
                    Capacity = 200,
                    Description = "Elegant event space in the heart of downtown",
                    ContactPhone = "+1-555-0200",
                    ContactEmail = "bookings@downtownevents.com",
                    PricePerHour = 150.00m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Venue
                {
                    Name = "Riverside Gardens",
                    Address = "789 River Road",
                    City = "Chicago",
                    State = "IL",
                    PostalCode = "60601",
                    Capacity = 150,
                    Description = "Beautiful outdoor venue with garden setting",
                    ContactPhone = "+1-555-0300",
                    ContactEmail = "events@riversidegardens.com",
                    PricePerHour = 180.00m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Venues.AddRangeAsync(venues);
            await context.SaveChangesAsync();
        }

        private static async Task SeedEventsAsync(AppDbContext context, ApplicationUser admin)
        {
            if (await context.Events.AnyAsync())
                return;

            var venues = await context.Venues.ToListAsync();
            var venue1 = venues[0];
            var venue2 = venues[1];
            var venue3 = venues[2];

            var events = new List<Event>
            {
                new Event
                {
                    Title = "Tech Conference 2025",
                    Date = DateTime.UtcNow.AddDays(30),
                    EndDate = DateTime.UtcNow.AddDays(32),
                    Location = "Grand Conference Center",
                    Description = "Annual technology conference featuring industry leaders and innovation showcase. Join us for three days of inspiring talks, workshops, and networking opportunities.",
                    MaxAttendees = 500,
                    CurrentAttendees = 0,
                    Category = EventCategory.Conference,
                    Status = EventStatus.Published,
                    VenueId = venue1.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
                    TicketPrice = 299.99m,
                    IsFree = false,
                    RequiresApproval = false,
                    IsPublic = true,
                    OrganizerName = "Tech Events Inc",
                    OrganizerEmail = "contact@techevents.com",
                    OrganizerPhone = "+1-555-0400",
                    CreatedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Community Meetup - Web Development",
                    Date = DateTime.UtcNow.AddDays(7),
                    Location = "Downtown Event Space",
                    Description = "Monthly meetup for web developers to share knowledge and network. Topics include React, Node.js, and modern web technologies.",
                    MaxAttendees = 50,
                    CurrentAttendees = 0,
                    Category = EventCategory.Meetup,
                    Status = EventStatus.Published,
                    VenueId = venue2.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = true,
                    OrganizerName = "Dev Community",
                    OrganizerEmail = "hello@devcommunity.org",
                    CreatedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Annual Charity Gala",
                    Date = DateTime.UtcNow.AddDays(60),
                    EndDate = DateTime.UtcNow.AddDays(60).AddHours(5),
                    Location = "Grand Conference Center",
                    Description = "Elegant charity gala to support local education initiatives. Formal attire required.",
                    MaxAttendees = 300,
                    CurrentAttendees = 0,
                    Category = EventCategory.Corporate,
                    Status = EventStatus.Published,
                    VenueId = venue1.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622",
                    TicketPrice = 150.00m,
                    IsFree = false,
                    RequiresApproval = true,
                    IsPublic = true,
                    OrganizerName = "Education Foundation",
                    OrganizerEmail = "events@edufoundation.org",
                    OrganizerPhone = "+1-555-0500",
                    CreatedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Summer Music Festival",
                    Date = DateTime.UtcNow.AddDays(90),
                    EndDate = DateTime.UtcNow.AddDays(92),
                    Location = "Riverside Gardens",
                    Description = "Three-day outdoor music festival featuring local and international artists. Food trucks and craft vendors on site.",
                    MaxAttendees = 1000,
                    CurrentAttendees = 0,
                    Category = EventCategory.Festival,
                    Status = EventStatus.Published,
                    VenueId = venue3.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
                    TicketPrice = 89.99m,
                    IsFree = false,
                    RequiresApproval = false,
                    IsPublic = true,
                    OrganizerName = "Live Music Events",
                    OrganizerEmail = "info@livemusicevents.com",
                    OrganizerPhone = "+1-555-0600",
                    CreatedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Professional Development Workshop",
                    Date = DateTime.UtcNow.AddDays(14),
                    Location = "Downtown Event Space",
                    Description = "Half-day workshop on leadership and management skills for mid-level professionals.",
                    MaxAttendees = 30,
                    CurrentAttendees = 0,
                    Category = EventCategory.Workshop,
                    Status = EventStatus.Published,
                    VenueId = venue2.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1552664730-d307ca884978",
                    TicketPrice = 75.00m,
                    IsFree = false,
                    RequiresApproval = false,
                    IsPublic = true,
                    OrganizerName = "Professional Growth Institute",
                    OrganizerEmail = "workshops@progrowth.com",
                    CreatedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Startup Pitch Competition",
                    Date = DateTime.UtcNow.AddDays(45),
                    Location = "Grand Conference Center",
                    Description = "Watch innovative startups pitch their ideas to a panel of investors. Networking reception to follow.",
                    MaxAttendees = 200,
                    CurrentAttendees = 0,
                    Category = EventCategory.Corporate,
                    Status = EventStatus.Draft,
                    VenueId = venue1.Id,
                    IsFree = true,
                    RequiresApproval = true,
                    IsPublic = false,
                    OrganizerName = "Startup Hub",
                    OrganizerEmail = "events@startuphub.io",
                    OrganizerPhone = "+1-555-0700",
                    CreatedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Events.AddRangeAsync(events);
            await context.SaveChangesAsync();
        }

        private static async Task SeedMenusAsync(AppDbContext context)
        {
            if (await context.Menus.AnyAsync())
                return;

            var events = await context.Events.ToListAsync();
            var techConference = events.FirstOrDefault(e => e.Title.Contains("Tech Conference"));
            var charityGala = events.FirstOrDefault(e => e.Title.Contains("Charity Gala"));

            var menus = new List<Menu>();

            if (techConference != null)
            {
                menus.AddRange(new[]
                {
                    new Menu
                    {
                        EventId = techConference.Id,
                        Name = "Standard Conference Package",
                        Category = "Catering",
                        Description = "Coffee, tea, pastries for breakfast. Buffet lunch with choice of proteins. Afternoon snacks and beverages.",
                        PricePerPerson = 45.00m,
                        MinimumGuests = 50,
                        IsVegetarian = false,
                        IsVegan = false,
                        IsGlutenFree = false,
                        AllergenInfo = "Contains gluten, dairy, nuts",
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Menu
                    {
                        EventId = techConference.Id,
                        Name = "Vegetarian Package",
                        Category = "Catering",
                        Description = "Plant-based meals with seasonal vegetables, grains, and legumes. Includes beverages and snacks.",
                        PricePerPerson = 42.00m,
                        MinimumGuests = 30,
                        IsVegetarian = true,
                        IsVegan = false,
                        IsGlutenFree = false,
                        AllergenInfo = "Contains dairy, may contain nuts",
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Menu
                    {
                        EventId = techConference.Id,
                        Name = "Premium Vegan Package",
                        Category = "Catering",
                        Description = "Gourmet plant-based cuisine with organic ingredients. Full day catering with specialty beverages.",
                        PricePerPerson = 55.00m,
                        MinimumGuests = 25,
                        IsVegetarian = true,
                        IsVegan = true,
                        IsGlutenFree = true,
                        AllergenInfo = "May contain tree nuts",
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    }
                });
            }

            if (charityGala != null)
            {
                menus.AddRange(new[]
                {
                    new Menu
                    {
                        EventId = charityGala.Id,
                        Name = "Gala Dinner - Classic",
                        Category = "Fine Dining",
                        Description = "Three-course plated dinner with wine pairing. Appetizer, entrée choice of beef or fish, and dessert.",
                        PricePerPerson = 85.00m,
                        MinimumGuests = 100,
                        IsVegetarian = false,
                        IsVegan = false,
                        IsGlutenFree = false,
                        AllergenInfo = "Contains gluten, dairy, shellfish",
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Menu
                    {
                        EventId = charityGala.Id,
                        Name = "Gala Dinner - Vegetarian",
                        Category = "Fine Dining",
                        Description = "Elegant three-course vegetarian menu with wine pairing. Seasonal vegetables and gourmet preparations.",
                        PricePerPerson = 80.00m,
                        MinimumGuests = 50,
                        IsVegetarian = true,
                        IsVegan = false,
                        IsGlutenFree = false,
                        AllergenInfo = "Contains dairy, eggs, may contain nuts",
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    }
                });
            }

            if (menus.Any())
            {
                await context.Menus.AddRangeAsync(menus);
                await context.SaveChangesAsync();
            }
        }
    }
}
