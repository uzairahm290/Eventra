using eventra_api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace eventra_api.Data
{
    // IMPORTANT: AppDbContext now inherits from IdentityDbContext<ApplicationUser>
    // This tells EF Core to include all identity tables for your ApplicationUser model.
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // The Event DbSet remains, handling your custom events table
        public DbSet<Event> Events { get; set; }

        // You may need to add this to prevent cascading delete cycles,
        // though it's often not strictly necessary in newer versions.
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            // Customize the Identity schema here if needed
        }
    }
}