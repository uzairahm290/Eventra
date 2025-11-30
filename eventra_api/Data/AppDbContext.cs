using eventra_api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace eventra_api.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<Event> Events { get; set; }
        public DbSet<Venue> Venues { get; set; }
        public DbSet<EventAttendee> EventAttendees { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Client> Clients { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure relationships and constraints

            // Event relationships
            builder.Entity<Event>()
                .HasOne(e => e.Venue)
                .WithMany(v => v.Events)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Event>()
                .HasOne(e => e.Creator)
                .WithMany(u => u.CreatedEvents)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // EventAttendee relationships
            builder.Entity<EventAttendee>()
                .HasOne(ea => ea.Event)
                .WithMany(e => e.Attendees)
                .HasForeignKey(ea => ea.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<EventAttendee>()
                .HasOne(ea => ea.User)
                .WithMany(u => u.EventAttendees)
                .HasForeignKey(ea => ea.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: one registration per user per event
            builder.Entity<EventAttendee>()
                .HasIndex(ea => new { ea.EventId, ea.UserId })
                .IsUnique();

            // Menu relationships
            builder.Entity<Menu>()
                .HasOne(m => m.Event)
                .WithMany(e => e.Menus)
                .HasForeignKey(m => m.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // Booking relationships
            builder.Entity<Booking>()
                .HasOne(b => b.Event)
                .WithMany(e => e.Bookings)
                .HasForeignKey(b => b.EventId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique booking reference
            builder.Entity<Booking>()
                .HasIndex(b => b.BookingReference)
                .IsUnique();

            // Notification relationships
            builder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Notification>()
                .HasOne(n => n.Event)
                .WithMany(e => e.Notifications)
                .HasForeignKey(n => n.EventId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Notification>()
                .HasOne(n => n.Booking)
                .WithMany()
                .HasForeignKey(n => n.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            // RefreshToken relationships
            builder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            // AuditLog relationships
            builder.Entity<AuditLog>()
                .HasOne(al => al.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Decimal precision for monetary values
            builder.Entity<Event>()
                .Property(e => e.TicketPrice)
                .HasPrecision(18, 2);

            builder.Entity<Venue>()
                .Property(v => v.PricePerHour)
                .HasPrecision(18, 2);

            builder.Entity<Menu>()
                .Property(m => m.PricePerPerson)
                .HasPrecision(18, 2);

            builder.Entity<Booking>()
                .Property(b => b.TotalAmount)
                .HasPrecision(18, 2);

            builder.Entity<Booking>()
                .Property(b => b.AmountPaid)
                .HasPrecision(18, 2);
        }
    }
}