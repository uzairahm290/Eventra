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
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
            if (pendingMigrations.Any())
                await context.Database.MigrateAsync();

            var (owner, managers) = await SeedUsersAsync(userManager, roleManager);
            await SeedVenuesAsync(context);
            await AssignManagerVenuesAsync(context, userManager, managers);
            await SeedHallsAsync(context);
            await SeedWorkersAsync(context);
            await SeedClientsAsync(context);
            await SeedEventsAsync(context, owner);
            await SeedMenusAsync(context);
            await SeedBookingsAsync(context, owner);
            await SeedAttendanceAsync(context, owner);
        }

        private static async Task<(ApplicationUser owner, List<ApplicationUser> managers)> SeedUsersAsync(
            UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            foreach (var role in new[] { "Owner", "Manager" })
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // --- Owner ---
            var owner = await userManager.FindByEmailAsync("owner@eventra.pk");
            if (owner == null)
            {
                owner = new ApplicationUser
                {
                    UserName = "zafar.owner",
                    Email = "owner@eventra.pk",
                    FirstName = "Zafar",
                    SecondName = "Iqbal",
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true,
                    IsApproved = true
                };
                await userManager.CreateAsync(owner, "Owner@12345!");
            }
            if (!await userManager.IsInRoleAsync(owner, "Owner"))
                await userManager.AddToRoleAsync(owner, "Owner");

            var managers = new List<ApplicationUser>();

            // --- Manager 1 (Al-Noor Marquee, Lahore) ---
            var mgr1 = await userManager.FindByEmailAsync("ali.manager@eventra.pk");
            if (mgr1 == null)
            {
                mgr1 = new ApplicationUser
                {
                    UserName = "ali.manager",
                    Email = "ali.manager@eventra.pk",
                    FirstName = "Ali",
                    SecondName = "Hassan",
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true,
                    IsApproved = true
                };
                await userManager.CreateAsync(mgr1, "Manager@12345!");
                if (!await userManager.IsInRoleAsync(mgr1, "Manager"))
                    await userManager.AddToRoleAsync(mgr1, "Manager");
            }
            managers.Add(mgr1);

            // --- Manager 2 (Pearl Continental Banquets, Karachi) ---
            var mgr2 = await userManager.FindByEmailAsync("sara.manager@eventra.pk");
            if (mgr2 == null)
            {
                mgr2 = new ApplicationUser
                {
                    UserName = "sara.manager",
                    Email = "sara.manager@eventra.pk",
                    FirstName = "Sara",
                    SecondName = "Khan",
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true,
                    IsApproved = true
                };
                await userManager.CreateAsync(mgr2, "Manager@12345!");
                if (!await userManager.IsInRoleAsync(mgr2, "Manager"))
                    await userManager.AddToRoleAsync(mgr2, "Manager");
            }
            managers.Add(mgr2);

            // --- Manager 3 (Rawal Garden Marquee, Islamabad) ---
            var mgr3 = await userManager.FindByEmailAsync("usman.manager@eventra.pk");
            if (mgr3 == null)
            {
                mgr3 = new ApplicationUser
                {
                    UserName = "usman.manager",
                    Email = "usman.manager@eventra.pk",
                    FirstName = "Usman",
                    SecondName = "Tariq",
                    DateRegistered = DateTime.UtcNow,
                    IsActive = true,
                    IsApproved = true
                };
                await userManager.CreateAsync(mgr3, "Manager@12345!");
                if (!await userManager.IsInRoleAsync(mgr3, "Manager"))
                    await userManager.AddToRoleAsync(mgr3, "Manager");
            }
            managers.Add(mgr3);

            return (owner, managers);
        }

        private static async Task SeedVenuesAsync(AppDbContext context)
        {
            if (await context.Venues.AnyAsync()) return;

            var venues = new List<Venue>
            {
                new Venue
                {
                    Name = "Al-Noor Marquee",
                    Address = "Plot 12, Main Boulevard, Gulberg III",
                    City = "Lahore",
                    State = "Punjab",
                    PostalCode = "54000",
                    Capacity = 800,
                    Description = "Lahore's premier wedding marquee with stunning decor, spacious banquet halls, and on-site catering for up to 800 guests.",
                    ContactPhone = "042-35761234",
                    ContactEmail = "info@alnoormarquee.pk",
                    PricePerHour = 15000m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Venue
                {
                    Name = "Pearl Continental Banquets",
                    Address = "Club Road, Civil Lines",
                    City = "Karachi",
                    State = "Sindh",
                    PostalCode = "74200",
                    Capacity = 1200,
                    Description = "Karachi's grand event venue offering luxury banquet halls, manicured lawns, and premium catering packages for weddings and corporate events.",
                    ContactPhone = "021-35672890",
                    ContactEmail = "banquets@pckarachi.pk",
                    PricePerHour = 25000m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Venue
                {
                    Name = "Rawal Garden Marquee",
                    Address = "7th Avenue, F-8/2",
                    City = "Islamabad",
                    State = "ICT",
                    PostalCode = "44000",
                    Capacity = 600,
                    Description = "Islamabad's elegant marquee set amidst lush gardens, ideal for walima, mehndi, and corporate dinners.",
                    ContactPhone = "051-2345678",
                    ContactEmail = "events@rawalgarden.pk",
                    PricePerHour = 20000m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Venues.AddRangeAsync(venues);
            await context.SaveChangesAsync();
        }

        private static async Task AssignManagerVenuesAsync(AppDbContext context,
            UserManager<ApplicationUser> userManager, List<ApplicationUser> managers)
        {
            var venues = await context.Venues.OrderBy(v => v.Id).ToListAsync();
            if (!venues.Any()) return;

            for (int i = 0; i < Math.Min(managers.Count, venues.Count); i++)
            {
                var mgr = managers[i];
                var venue = venues[i];
                if (mgr.VenueId != venue.Id)
                {
                    mgr.VenueId = venue.Id;
                    await userManager.UpdateAsync(mgr);
                }
            }
        }

        private static async Task SeedHallsAsync(AppDbContext context)
        {
            if (await context.Halls.AnyAsync()) return;

            var venues = await context.Venues.OrderBy(v => v.Id).ToListAsync();
            if (!venues.Any()) return;

            var halls = new List<Hall>();

            foreach (var venue in venues)
            {
                halls.AddRange(new[]
                {
                    new Hall
                    {
                        VenueId = venue.Id,
                        TenantId = venue.TenantId,
                        Name = "Main Banquet Hall",
                        Capacity = (int)(venue.Capacity * 0.65),
                        Description = "Grand hall with chandelier lighting, stage, and dance floor — ideal for Walima and formal dinners.",
                        PricePerHour = venue.PricePerHour,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Hall
                    {
                        VenueId = venue.Id,
                        TenantId = venue.TenantId,
                        Name = "Mehndi Lawn",
                        Capacity = (int)(venue.Capacity * 0.45),
                        Description = "Open-air lawn decorated with string lights and floral arrangements, perfect for Mehndi and Dholki nights.",
                        PricePerHour = venue.PricePerHour.HasValue ? venue.PricePerHour * 0.7m : null,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Hall
                    {
                        VenueId = venue.Id,
                        TenantId = venue.TenantId,
                        Name = "VIP Lounge",
                        Capacity = (int)(venue.Capacity * 0.15),
                        Description = "Intimate VIP room with premium furnishings for Nikkah ceremonies and exclusive gatherings.",
                        PricePerHour = venue.PricePerHour.HasValue ? venue.PricePerHour * 0.4m : null,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                });
            }

            await context.Halls.AddRangeAsync(halls);
            await context.SaveChangesAsync();
        }

        private static async Task SeedWorkersAsync(AppDbContext context)
        {
            if (await context.Workers.AnyAsync()) return;

            var venues = await context.Venues.OrderBy(v => v.Id).ToListAsync();
            if (!venues.Any()) return;

            // Per-venue worker roster
            var rosters = new[]
            {
                // Al-Noor, Lahore
                new[]
                {
                    (WorkerType.Cook,       "Muhammad Rafiq",   "0300-4412345", "35201-7654321-1", "Mozang, Lahore",       1500m),
                    (WorkerType.Cook,       "Basharat Ali",     "0301-5523456", "35202-8765432-2", "Sanda Road, Lahore",   1400m),
                    (WorkerType.Waiter,     "Imran Butt",       "0303-6634567", "35203-9876543-3", "Krishan Nagar, Lahore",900m),
                    (WorkerType.Waiter,     "Naveed Aslam",     "0305-7745678", "35204-0987654-4", "Bhati Gate, Lahore",   900m),
                    (WorkerType.Waiter,     "Tariq Mahmood",    "0307-8856789", "35205-1098765-5", "Data Nagar, Lahore",   900m),
                    (WorkerType.Security,   "Ghulam Rasool",    "0311-9967890", "35206-2109876-6", "Shadbagh, Lahore",    1000m),
                    (WorkerType.Security,   "Qaiser Khan",      "0313-1078901", "35207-3210987-7", "Garhi Shahu, Lahore", 1000m),
                    (WorkerType.Sweeper,    "Saleem Masih",     "0315-2189012", "35208-4321098-8", "Iqbal Town, Lahore",   750m),
                    (WorkerType.Accountant, "Fareeha Naz",      "0317-3290123", "35209-5432109-9", "Gulberg II, Lahore",  2000m),
                    (WorkerType.Driver,     "Zubair Haider",    "0319-4301234", "35210-6543210-0", "Model Town, Lahore",   850m),
                },
                // Pearl Continental, Karachi
                new[]
                {
                    (WorkerType.Cook,       "Rashid Karimi",    "0321-5412345", "42101-7651234-1", "PECHS, Karachi",       1800m),
                    (WorkerType.Cook,       "Shahid Baloch",    "0323-6523456", "42102-8762345-2", "Clifton, Karachi",     1700m),
                    (WorkerType.Waiter,     "Asif Raza",        "0325-7634567", "42103-9873456-3", "Nazimabad, Karachi",   950m),
                    (WorkerType.Waiter,     "Junaid Memon",     "0327-8745678", "42104-0984567-4", "North Karachi",        950m),
                    (WorkerType.Waiter,     "Bilal Siddiqui",   "0329-9856789", "42105-1095678-5", "Gulshan-e-Iqbal",      950m),
                    (WorkerType.Security,   "Arshad Pathan",    "0331-0967890", "42106-2106789-6", "Landhi, Karachi",     1100m),
                    (WorkerType.Security,   "Irfan Niazi",      "0333-2078901", "42107-3217890-7", "Korangi, Karachi",    1100m),
                    (WorkerType.Cleaner,    "Younus Masih",     "0335-3189012", "42108-4328901-8", "Orangi Town, Karachi",  800m),
                    (WorkerType.Accountant, "Nadia Farooq",     "0337-4290123", "42109-5439012-9", "DHA Phase 5, Karachi", 2200m),
                    (WorkerType.Driver,     "Waqas Ahmed",      "0339-5301234", "42110-6540123-0", "Malir, Karachi",        900m),
                },
                // Rawal Garden, Islamabad
                new[]
                {
                    (WorkerType.Cook,       "Liaqat Shah",      "0341-6412345", "61101-7652345-1", "G-10/3, Islamabad",    1600m),
                    (WorkerType.Cook,       "Mehmood Awan",     "0343-7523456", "61102-8763456-2", "I-8/2, Islamabad",     1500m),
                    (WorkerType.Waiter,     "Faisal Chaudhry",  "0345-8634567", "61103-9874567-3", "F-6/1, Islamabad",      920m),
                    (WorkerType.Waiter,     "Asad Malik",       "0347-9745678", "61104-0985678-4", "G-7/2, Islamabad",      920m),
                    (WorkerType.Waiter,     "Hamza Qureshi",    "0349-0856789", "61105-1096789-5", "F-8/4, Islamabad",      920m),
                    (WorkerType.Security,   "Siraj Butt",       "0351-1967890", "61106-2107890-6", "H-11, Islamabad",      1050m),
                    (WorkerType.Sweeper,    "Sunny Masih",      "0353-3078901", "61107-3218901-7", "G-11/1, Islamabad",     780m),
                    (WorkerType.Accountant, "Hira Baig",        "0355-4189012", "61108-4329012-8", "F-7/3, Islamabad",     2100m),
                    (WorkerType.Driver,     "Adnan Riaz",       "0357-5290123", "61109-5430123-9", "E-11/4, Islamabad",     870m),
                    (WorkerType.Other,      "Kamran Lodhi",     "0359-6301234", "61110-6541234-0", "G-9/4, Islamabad",      800m),
                }
            };

            var workers = new List<Worker>();
            for (int i = 0; i < Math.Min(venues.Count, rosters.Length); i++)
            {
                foreach (var (type, name, phone, cnic, address, salary) in rosters[i])
                {
                    workers.Add(new Worker
                    {
                        VenueId = venues[i].Id,
                        Name = name,
                        Type = type,
                        Phone = phone,
                        CNIC = cnic,
                        Address = address,
                        DailySalary = salary,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await context.Workers.AddRangeAsync(workers);
            await context.SaveChangesAsync();
        }

        private static async Task SeedClientsAsync(AppDbContext context)
        {
            if (await context.Clients.AnyAsync()) return;

            var clients = new List<Client>
            {
                new Client { FirstName = "Kamran",    SecondName = "Mirza",     Email = "kamran.mirza@gmail.com",    Phone = "0300-1112233", CNIC = "35201-1234567-1", Address = "House 5, Street 12, DHA Phase 4, Lahore",    Company = null,             DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Sobia",     SecondName = "Ansari",    Email = "sobia.ansari@gmail.com",    Phone = "0312-2223344", CNIC = "35202-2345678-2", Address = "Flat 3B, Johar Town, Lahore",                Company = "Ansari Textile", DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Fahad",     SecondName = "Sheikh",    Email = "fahad.sheikh@gmail.com",    Phone = "0321-3334455", CNIC = "42101-3456789-3", Address = "Plot 22, Clifton Block 2, Karachi",           Company = "Sheikh Traders", DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Amna",      SecondName = "Siddiqui",  Email = "amna.siddiqui@gmail.com",   Phone = "0333-4445566", CNIC = "42102-4567890-4", Address = "House 77, Gulshan-e-Iqbal, Karachi",          Company = null,             DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Bilal",     SecondName = "Chaudhry",  Email = "bilal.ch@gmail.com",        Phone = "0345-5556677", CNIC = "61101-5678901-5", Address = "House 14, F-8/2, Islamabad",                  Company = "Chaudhry Group", DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Rabia",     SecondName = "Farooqi",   Email = "rabia.farooqi@yahoo.com",   Phone = "0300-6667788", CNIC = "61102-6789012-6", Address = "Apt 2A, G-10 Markaz, Islamabad",             Company = null,             DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Usman",     SecondName = "Butt",      Email = "usman.butt@hotmail.com",    Phone = "0301-7778899", CNIC = "35203-7890123-7", Address = "13-C Model Town Extension, Lahore",          Company = "Butt Steel",     DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Hira",      SecondName = "Nawaz",     Email = "hira.nawaz@gmail.com",      Phone = "0303-8889900", CNIC = "35204-8901234-8", Address = "House 101, Bahria Town Phase 6, Lahore",      Company = null,             DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Asad",      SecondName = "Raza",      Email = "asad.raza@gmail.com",       Phone = "0311-9990011", CNIC = "42103-9012345-9", Address = "Plot 7, PECHS Block 3, Karachi",              Company = "Raza Imports",   DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Nadia",     SecondName = "Khalid",    Email = "nadia.khalid@gmail.com",    Phone = "0315-0001122", CNIC = "42104-0123456-0", Address = "House 33, North Nazimabad Block L, Karachi",  Company = null,             DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Zubair",    SecondName = "Hussain",   Email = "zubair.h@gmail.com",        Phone = "0321-1112233", CNIC = "61103-1234560-1", Address = "Street 4, I-10/3, Islamabad",                 Company = "Hussain Motors", DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Mehwish",   SecondName = "Sultan",    Email = "mehwish.sultan@gmail.com",  Phone = "0333-2223344", CNIC = "61104-2345671-2", Address = "House 9, E-7, Islamabad",                     Company = null,             DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Tariq",     SecondName = "Javed",     Email = "tariq.javed@gmail.com",     Phone = "0345-3334455", CNIC = "35205-3456782-3", Address = "23 Gulberg II, Lahore",                       Company = "Javed Pharma",   DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Ayesha",    SecondName = "Malik",     Email = "ayesha.malik@gmail.com",    Phone = "0300-4445566", CNIC = "35206-4567893-4", Address = "House 45, Wapda Town Phase 1, Lahore",        Company = null,             DateRegistered = DateTime.UtcNow },
                new Client { FirstName = "Imran",     SecondName = "Ghani",     Email = "imran.ghani@gmail.com",     Phone = "0313-5556677", CNIC = "42105-5678904-5", Address = "Flat B-4, Gulshan Block 6, Karachi",          Company = "Ghani Builders", DateRegistered = DateTime.UtcNow },
            };

            await context.Clients.AddRangeAsync(clients);
            await context.SaveChangesAsync();
        }

        private static async Task SeedEventsAsync(AppDbContext context, ApplicationUser owner)
        {
            if (await context.Events.AnyAsync()) return;

            var venues = await context.Venues.OrderBy(v => v.Id).ToListAsync();
            if (!venues.Any()) return;

            var halls = await context.Halls.OrderBy(h => h.Id).ToListAsync();
            var lahoreVenue   = venues[0];
            var karachiVenue  = venues[1];
            var islamabadVenue = venues[2];

            Hall? GetHall(int venueId, string name) =>
                halls.FirstOrDefault(h => h.VenueId == venueId && h.Name == name);

            var events = new List<Event>
            {
                new Event
                {
                    Title = "Walima — Kamran & Sobia",
                    Date = DateTime.UtcNow.AddDays(15),
                    EndDate = DateTime.UtcNow.AddDays(15).AddHours(6),
                    Location = "Al-Noor Marquee — Main Banquet Hall",
                    Description = "Grand walima reception for the Mirza family. Formal seating for 400 guests, stage, live qawwali.",
                    MaxAttendees = 400,
                    CurrentAttendees = 0,
                    Category = EventCategory.Wedding,
                    Status = EventStatus.Published,
                    VenueId = lahoreVenue.Id,
                    HallId = GetHall(lahoreVenue.Id, "Main Banquet Hall")?.Id,
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = false,
                    OrganizerName = "Kamran Mirza",
                    OrganizerPhone = "0300-1112233",
                    OrganizerEmail = "kamran.mirza@gmail.com",
                    CreatedBy = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Mehndi Night — Fahad & Amna",
                    Date = DateTime.UtcNow.AddDays(22),
                    EndDate = DateTime.UtcNow.AddDays(22).AddHours(5),
                    Location = "Pearl Continental Banquets — Mehndi Lawn",
                    Description = "Colourful mehndi and dholki night. Dhol wala, open food stalls, fairy lights.",
                    MaxAttendees = 350,
                    CurrentAttendees = 0,
                    Category = EventCategory.Wedding,
                    Status = EventStatus.Published,
                    VenueId = karachiVenue.Id,
                    HallId = GetHall(karachiVenue.Id, "Mehndi Lawn")?.Id,
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = false,
                    OrganizerName = "Fahad Sheikh",
                    OrganizerPhone = "0321-3334455",
                    OrganizerEmail = "fahad.sheikh@gmail.com",
                    CreatedBy = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Nikkah Ceremony — Bilal & Rabia",
                    Date = DateTime.UtcNow.AddDays(8),
                    EndDate = DateTime.UtcNow.AddDays(8).AddHours(3),
                    Location = "Rawal Garden Marquee — VIP Lounge",
                    Description = "Intimate nikkah ceremony with close family. Followed by a hi-tea reception.",
                    MaxAttendees = 80,
                    CurrentAttendees = 0,
                    Category = EventCategory.Wedding,
                    Status = EventStatus.Published,
                    VenueId = islamabadVenue.Id,
                    HallId = GetHall(islamabadVenue.Id, "VIP Lounge")?.Id,
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = false,
                    OrganizerName = "Bilal Chaudhry",
                    OrganizerPhone = "0345-5556677",
                    OrganizerEmail = "bilal.ch@gmail.com",
                    CreatedBy = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Corporate Annual Dinner — Butt Steel",
                    Date = DateTime.UtcNow.AddDays(30),
                    EndDate = DateTime.UtcNow.AddDays(30).AddHours(4),
                    Location = "Al-Noor Marquee — Main Banquet Hall",
                    Description = "Butt Steel annual dinner for 150 employees. Buffet dinner, award ceremony, and entertainment.",
                    MaxAttendees = 150,
                    CurrentAttendees = 0,
                    Category = EventCategory.Corporate,
                    Status = EventStatus.Published,
                    VenueId = lahoreVenue.Id,
                    HallId = GetHall(lahoreVenue.Id, "Main Banquet Hall")?.Id,
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = false,
                    OrganizerName = "Usman Butt",
                    OrganizerPhone = "0301-7778899",
                    OrganizerEmail = "usman.butt@hotmail.com",
                    CreatedBy = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Birthday Gala — Nadia Khalid's 30th",
                    Date = DateTime.UtcNow.AddDays(45),
                    EndDate = DateTime.UtcNow.AddDays(45).AddHours(5),
                    Location = "Pearl Continental Banquets — Main Banquet Hall",
                    Description = "Elegant birthday celebration for 200 guests. Themed decor, live music, and 3-tier cake.",
                    MaxAttendees = 200,
                    CurrentAttendees = 0,
                    Category = EventCategory.Birthday,
                    Status = EventStatus.Published,
                    VenueId = karachiVenue.Id,
                    HallId = GetHall(karachiVenue.Id, "Main Banquet Hall")?.Id,
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = false,
                    OrganizerName = "Nadia Khalid",
                    OrganizerPhone = "0315-0001122",
                    OrganizerEmail = "nadia.khalid@gmail.com",
                    CreatedBy = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Walima Reception — Zubair & Mehwish",
                    Date = DateTime.UtcNow.AddDays(60),
                    EndDate = DateTime.UtcNow.AddDays(60).AddHours(6),
                    Location = "Rawal Garden Marquee — Main Banquet Hall",
                    Description = "Grand walima for 500 guests. Qawwali and nasheed performance, premium dinner.",
                    MaxAttendees = 500,
                    CurrentAttendees = 0,
                    Category = EventCategory.Wedding,
                    Status = EventStatus.Published,
                    VenueId = islamabadVenue.Id,
                    HallId = GetHall(islamabadVenue.Id, "Main Banquet Hall")?.Id,
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = false,
                    OrganizerName = "Zubair Hussain",
                    OrganizerPhone = "0321-1112233",
                    OrganizerEmail = "zubair.h@gmail.com",
                    CreatedBy = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Product Launch — Javed Pharma",
                    Date = DateTime.UtcNow.AddDays(20),
                    EndDate = DateTime.UtcNow.AddDays(20).AddHours(4),
                    Location = "Al-Noor Marquee — VIP Lounge",
                    Description = "New pharmaceutical product launch dinner for 60 doctors and executives.",
                    MaxAttendees = 60,
                    CurrentAttendees = 0,
                    Category = EventCategory.Corporate,
                    Status = EventStatus.Draft,
                    VenueId = lahoreVenue.Id,
                    HallId = GetHall(lahoreVenue.Id, "VIP Lounge")?.Id,
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = false,
                    OrganizerName = "Tariq Javed",
                    OrganizerPhone = "0345-3334455",
                    OrganizerEmail = "tariq.javed@gmail.com",
                    CreatedBy = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Mehndi Night — Asad & Ayesha",
                    Date = DateTime.UtcNow.AddDays(12),
                    EndDate = DateTime.UtcNow.AddDays(12).AddHours(5),
                    Location = "Pearl Continental Banquets — Mehndi Lawn",
                    Description = "Vibrant outdoor mehndi with dhol, zardozi decor, and traditional food corners.",
                    MaxAttendees = 250,
                    CurrentAttendees = 0,
                    Category = EventCategory.Wedding,
                    Status = EventStatus.Published,
                    VenueId = karachiVenue.Id,
                    HallId = GetHall(karachiVenue.Id, "Mehndi Lawn")?.Id,
                    IsFree = true,
                    RequiresApproval = false,
                    IsPublic = false,
                    OrganizerName = "Asad Raza",
                    OrganizerPhone = "0311-9990011",
                    OrganizerEmail = "asad.raza@gmail.com",
                    CreatedBy = owner.Id,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Events.AddRangeAsync(events);
            await context.SaveChangesAsync();
        }

        private static async Task SeedMenusAsync(AppDbContext context)
        {
            if (await context.Menus.AnyAsync()) return;

            var venues = await context.Venues.OrderBy(v => v.Id).ToListAsync();
            if (!venues.Any()) return;

            var menus = new List<Menu>();

            foreach (var venue in venues)
            {
                menus.AddRange(new[]
                {
                    new Menu
                    {
                        VenueId = venue.Id,
                        Name = "Silver Walima Package",
                        Category = "Catering",
                        Description = "Buffet with chicken karahi, biryani, daal makhani, salads, naan, and firni. Ideal for 200–400 guests.",
                        PricePerPerson = 1800m,
                        MinimumGuests = 150,
                        IsVegetarian = false,
                        IsVegan = false,
                        IsGlutenFree = false,
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Menu
                    {
                        VenueId = venue.Id,
                        Name = "Gold Wedding Package",
                        Category = "Catering",
                        Description = "Premium 6-course menu: mutton biryani, beef nihari, chicken tikka, mixed veggies, desserts (kheer, gulab jamun), and cold drinks.",
                        PricePerPerson = 3200m,
                        MinimumGuests = 200,
                        IsVegetarian = false,
                        IsVegan = false,
                        IsGlutenFree = false,
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Menu
                    {
                        VenueId = venue.Id,
                        Name = "Mehndi BBQ Package",
                        Category = "BBQ",
                        Description = "Open BBQ with seekh kebabs, boti, tikka, grilled fish, raita, chutney, and naan. Perfect for outdoor Mehndi nights.",
                        PricePerPerson = 1200m,
                        MinimumGuests = 80,
                        IsVegetarian = false,
                        IsVegan = false,
                        IsGlutenFree = false,
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Menu
                    {
                        VenueId = venue.Id,
                        Name = "Hi-Tea Package",
                        Category = "Tea",
                        Description = "Finger sandwiches, samosas, pastries, tea, coffee, fruit juices. Suitable for Nikkah receptions and corporate meets.",
                        PricePerPerson = 700m,
                        MinimumGuests = 30,
                        IsVegetarian = false,
                        IsVegan = false,
                        IsGlutenFree = false,
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Menu
                    {
                        VenueId = venue.Id,
                        Name = "Vegetarian Feast",
                        Category = "Catering",
                        Description = "All-vegetarian menu: daal tadka, aloo gobi, paneer, mix sabzi, raita, naan, and kheer.",
                        PricePerPerson = 1000m,
                        MinimumGuests = 50,
                        IsVegetarian = true,
                        IsVegan = false,
                        IsGlutenFree = false,
                        IsAvailable = true,
                        CreatedAt = DateTime.UtcNow
                    }
                });
            }

            await context.Menus.AddRangeAsync(menus);
            await context.SaveChangesAsync();
        }

        private static async Task SeedBookingsAsync(AppDbContext context, ApplicationUser owner)
        {
            if (await context.Bookings.AnyAsync()) return;

            var clients = await context.Clients.OrderBy(c => c.Id).ToListAsync();
            var events  = await context.Events.OrderBy(e => e.Id).ToListAsync();
            var halls   = await context.Halls.OrderBy(h => h.Id).ToListAsync();

            if (!clients.Any() || !events.Any() || !halls.Any()) return;

            static string Ref(string prefix, int n) => $"{prefix}-{DateTime.UtcNow:yyyyMM}-{n:D4}";

            var bookings = new List<Booking>
            {
                new Booking
                {
                    EventId = events[0].Id,  // Walima Kamran & Sobia
                    ClientId = clients[0].Id, // Kamran Mirza
                    HallId = events[0].HallId,
                    BookingReference = Ref("EVT", 1),
                    BookingDate = DateTime.UtcNow.AddDays(-5),
                    Status = BookingStatus.Confirmed,
                    NumberOfGuests = 400,
                    TotalAmount = 720000m,   // 400 × ₨1800
                    DepositAmount = 200000m,
                    AmountPaid = 200000m,
                    PaymentMethod = "Bank Transfer",
                    PaymentDate = DateTime.UtcNow.AddDays(-4),
                    IsApprovedByAdmin = true,
                    SpecialRequests = "Qawwali performance after dinner. No DJ.",
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Booking
                {
                    EventId = events[1].Id,  // Mehndi Fahad & Amna
                    ClientId = clients[2].Id, // Fahad Sheikh
                    HallId = events[1].HallId,
                    BookingReference = Ref("EVT", 2),
                    BookingDate = DateTime.UtcNow.AddDays(-10),
                    Status = BookingStatus.Confirmed,
                    NumberOfGuests = 350,
                    TotalAmount = 420000m,   // 350 × ₨1200 BBQ
                    DepositAmount = 150000m,
                    AmountPaid = 150000m,
                    PaymentMethod = "Cash",
                    PaymentDate = DateTime.UtcNow.AddDays(-9),
                    IsApprovedByAdmin = true,
                    SpecialRequests = "Dhol group to arrive by 8 PM. Flower wall required.",
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Booking
                {
                    EventId = events[2].Id,  // Nikkah Bilal & Rabia
                    ClientId = clients[4].Id, // Bilal Chaudhry
                    HallId = events[2].HallId,
                    BookingReference = Ref("EVT", 3),
                    BookingDate = DateTime.UtcNow.AddDays(-3),
                    Status = BookingStatus.Pending,
                    NumberOfGuests = 70,
                    TotalAmount = 49000m,    // 70 × ₨700 Hi-Tea
                    DepositAmount = 20000m,
                    AmountPaid = 0m,
                    PaymentMethod = null,
                    IsApprovedByAdmin = false,
                    SpecialRequests = "Arrange rose petals on the stage. Simple decor only.",
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Booking
                {
                    EventId = events[3].Id,  // Corporate Dinner — Butt Steel
                    ClientId = clients[6].Id, // Usman Butt
                    HallId = events[3].HallId,
                    BookingReference = Ref("EVT", 4),
                    BookingDate = DateTime.UtcNow.AddDays(-15),
                    Status = BookingStatus.Confirmed,
                    NumberOfGuests = 150,
                    TotalAmount = 270000m,   // 150 × ₨1800 Silver
                    DepositAmount = 100000m,
                    AmountPaid = 100000m,
                    PaymentMethod = "Cheque",
                    PaymentDate = DateTime.UtcNow.AddDays(-14),
                    IsApprovedByAdmin = true,
                    SpecialRequests = "Company banner and projector screen required. Mic & podium for awards.",
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new Booking
                {
                    EventId = events[4].Id,  // Birthday Nadia
                    ClientId = clients[9].Id, // Nadia Khalid
                    HallId = events[4].HallId,
                    BookingReference = Ref("EVT", 5),
                    BookingDate = DateTime.UtcNow.AddDays(-7),
                    Status = BookingStatus.Confirmed,
                    NumberOfGuests = 180,
                    TotalAmount = 576000m,   // 180 × ₨3200 Gold
                    DepositAmount = 200000m,
                    AmountPaid = 200000m,
                    PaymentMethod = "Bank Transfer",
                    PaymentDate = DateTime.UtcNow.AddDays(-6),
                    IsApprovedByAdmin = true,
                    SpecialRequests = "3-tier chocolate cake (vanilla sponge). Rose-gold theme decor.",
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new Booking
                {
                    EventId = events[5].Id,  // Walima Zubair & Mehwish
                    ClientId = clients[10].Id, // Zubair Hussain
                    HallId = events[5].HallId,
                    BookingReference = Ref("EVT", 6),
                    BookingDate = DateTime.UtcNow.AddDays(-2),
                    Status = BookingStatus.Pending,
                    NumberOfGuests = 450,
                    TotalAmount = 1440000m,  // 450 × ₨3200 Gold
                    DepositAmount = 400000m,
                    AmountPaid = 0m,
                    PaymentMethod = null,
                    IsApprovedByAdmin = false,
                    SpecialRequests = "Separate seating for gents and ladies. Qawwali group required.",
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Booking
                {
                    EventId = events[7].Id,  // Mehndi Asad & Ayesha
                    ClientId = clients[8].Id, // Asad Raza
                    HallId = events[7].HallId,
                    BookingReference = Ref("EVT", 7),
                    BookingDate = DateTime.UtcNow.AddDays(-4),
                    Status = BookingStatus.Confirmed,
                    NumberOfGuests = 220,
                    TotalAmount = 264000m,   // 220 × ₨1200 BBQ
                    DepositAmount = 100000m,
                    AmountPaid = 100000m,
                    PaymentMethod = "Cash",
                    PaymentDate = DateTime.UtcNow.AddDays(-3),
                    IsApprovedByAdmin = true,
                    SpecialRequests = "Open-air seating. Fairy lights on all trees. 2 dhol players.",
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new Booking
                {
                    EventId = events[0].Id,  // Walima Kamran — second booking (cancelled example)
                    ClientId = clients[12].Id, // Tariq Javed (tried to book same event)
                    HallId = events[0].HallId,
                    BookingReference = Ref("EVT", 8),
                    BookingDate = DateTime.UtcNow.AddDays(-20),
                    Status = BookingStatus.Cancelled,
                    NumberOfGuests = 100,
                    TotalAmount = 180000m,
                    DepositAmount = 50000m,
                    AmountPaid = 50000m,
                    PaymentMethod = "Bank Transfer",
                    PaymentDate = DateTime.UtcNow.AddDays(-19),
                    IsApprovedByAdmin = false,
                    CancellationReason = "Client cancelled due to change of date.",
                    CancellationDate = DateTime.UtcNow.AddDays(-12),
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                }
            };

            await context.Bookings.AddRangeAsync(bookings);
            await context.SaveChangesAsync();
        }

        private static async Task SeedAttendanceAsync(AppDbContext context, ApplicationUser owner)
        {
            if (await context.Attendances.AnyAsync()) return;

            var workers = await context.Workers.OrderBy(w => w.Id).ToListAsync();
            if (!workers.Any()) return;

            var attendance = new List<Attendance>();
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Seed last 7 days of attendance for all workers
            for (int day = 6; day >= 0; day--)
            {
                var date = today.AddDays(-day);

                foreach (var worker in workers)
                {
                    // Skip Sundays
                    if (date.DayOfWeek == DayOfWeek.Sunday) continue;

                    // Randomise: 75% Present, 10% Absent, 10% HalfDay, 5% Leave
                    var r = (worker.Id + day) % 20;
                    var status = r switch
                    {
                        0 or 1    => AttendanceStatus.Absent,
                        2 or 3    => AttendanceStatus.HalfDay,
                        4         => AttendanceStatus.Leave,
                        _         => AttendanceStatus.Present
                    };

                    TimeOnly? checkIn  = status == AttendanceStatus.Present  ? new TimeOnly(9, 0)  :
                                         status == AttendanceStatus.HalfDay  ? new TimeOnly(13, 0) : null;
                    TimeOnly? checkOut = status == AttendanceStatus.Present  ? new TimeOnly(21, 0) :
                                         status == AttendanceStatus.HalfDay  ? new TimeOnly(18, 0) : null;

                    attendance.Add(new Attendance
                    {
                        WorkerId = worker.Id,
                        Date = date,
                        Status = status,
                        CheckInTime = checkIn,
                        CheckOutTime = checkOut,
                        MarkedBy = owner.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-day)
                    });
                }
            }

            await context.Attendances.AddRangeAsync(attendance);
            await context.SaveChangesAsync();
        }
    }
}
