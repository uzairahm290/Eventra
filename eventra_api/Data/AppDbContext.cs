using eventra_api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using eventra_api.Services;

namespace eventra_api.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        private readonly ITenantProvider? _tenantProvider;

        public AppDbContext(DbContextOptions<AppDbContext> options, ITenantProvider? tenantProvider = null) : base(options)
        {
            _tenantProvider = tenantProvider;
        }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Venue> Venues { get; set; }
        public DbSet<Hall> Halls { get; set; }
        public DbSet<EventAttendee> EventAttendees { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<EventMenu> EventMenus { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Worker> Workers { get; set; }
        public DbSet<Attendance> Attendances { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantProvider?.GetTenantId();
            if (tenantId.HasValue)
            {
                foreach (var entry in ChangeTracker.Entries()
                    .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified))
                {
                    var tenantIdProp = entry.Entity.GetType().GetProperty("TenantId");
                    if (tenantIdProp != null)
                        tenantIdProp.SetValue(entry.Entity, tenantId.Value);
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // ── Global Query Filters (Multi-Tenancy) ─────────────────────────
            builder.Entity<Event>().HasQueryFilter(e =>
                _tenantProvider == null || !_tenantProvider.GetTenantId().HasValue ||
                e.TenantId == _tenantProvider.GetTenantId());

            builder.Entity<Venue>().HasQueryFilter(v =>
                _tenantProvider == null || !_tenantProvider.GetTenantId().HasValue ||
                v.TenantId == _tenantProvider.GetTenantId());

            builder.Entity<Hall>().HasQueryFilter(h =>
                _tenantProvider == null || !_tenantProvider.GetTenantId().HasValue ||
                h.TenantId == _tenantProvider.GetTenantId());

            builder.Entity<Booking>().HasQueryFilter(b =>
                _tenantProvider == null || !_tenantProvider.GetTenantId().HasValue ||
                b.TenantId == _tenantProvider.GetTenantId());

            builder.Entity<Menu>().HasQueryFilter(m =>
                _tenantProvider == null || !_tenantProvider.GetTenantId().HasValue ||
                m.TenantId == _tenantProvider.GetTenantId());

            builder.Entity<Client>().HasQueryFilter(c =>
                _tenantProvider == null || !_tenantProvider.GetTenantId().HasValue ||
                c.TenantId == _tenantProvider.GetTenantId());

            builder.Entity<Worker>().HasQueryFilter(w =>
                _tenantProvider == null || !_tenantProvider.GetTenantId().HasValue ||
                w.TenantId == _tenantProvider.GetTenantId());

            builder.Entity<ApplicationUser>().HasQueryFilter(u =>
                _tenantProvider == null || !_tenantProvider.GetTenantId().HasValue ||
                u.TenantId == _tenantProvider.GetTenantId());

            // ── Hall ──────────────────────────────────────────────────────────
            builder.Entity<Hall>()
                .HasOne(h => h.Venue)
                .WithMany(v => v.Halls)
                .HasForeignKey(h => h.VenueId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Hall>()
                .Property(h => h.PricePerHour)
                .HasPrecision(18, 2);

            // ── Event ─────────────────────────────────────────────────────────
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

            builder.Entity<Event>()
                .HasOne(e => e.Hall)
                .WithMany(h => h.Events)
                .HasForeignKey(e => e.HallId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Event>()
                .Property(e => e.TicketPrice)
                .HasPrecision(18, 2);

            // ── EventAttendee ─────────────────────────────────────────────────
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

            builder.Entity<EventAttendee>()
                .HasIndex(ea => new { ea.EventId, ea.UserId })
                .IsUnique();

            // ── Menu (now Venue-scoped) ───────────────────────────────────────
            builder.Entity<Menu>()
                .HasOne(m => m.Venue)
                .WithMany(v => v.Menus)
                .HasForeignKey(m => m.VenueId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Menu>()
                .Property(m => m.PricePerPerson)
                .HasPrecision(18, 2);

            // ── EventMenu (junction) ──────────────────────────────────────────
            builder.Entity<EventMenu>()
                .HasKey(em => new { em.EventId, em.MenuId });

            builder.Entity<EventMenu>()
                .HasOne(em => em.Event)
                .WithMany(e => e.EventMenus)
                .HasForeignKey(em => em.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<EventMenu>()
                .HasOne(em => em.Menu)
                .WithMany(m => m.EventMenus)
                .HasForeignKey(em => em.MenuId)
                .OnDelete(DeleteBehavior.Cascade);

            // ── Booking (now Client-based) ────────────────────────────────────
            builder.Entity<Booking>()
                .HasOne(b => b.Event)
                .WithMany(e => e.Bookings)
                .HasForeignKey(b => b.EventId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Booking>()
                .HasOne(b => b.Client)
                .WithMany(c => c.Bookings)
                .HasForeignKey(b => b.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Booking>()
                .HasOne(b => b.Hall)
                .WithMany(h => h.Bookings)
                .HasForeignKey(b => b.HallId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Booking>()
                .HasIndex(b => b.BookingReference)
                .IsUnique();

            builder.Entity<Booking>()
                .Property(b => b.TotalAmount)
                .HasPrecision(18, 2);

            builder.Entity<Booking>()
                .Property(b => b.DepositAmount)
                .HasPrecision(18, 2);

            builder.Entity<Booking>()
                .Property(b => b.AmountPaid)
                .HasPrecision(18, 2);

            // ── Notification ──────────────────────────────────────────────────
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
                .WithMany(b => b.Notifications)
                .HasForeignKey(n => n.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            // ── RefreshToken ──────────────────────────────────────────────────
            builder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            // ── AuditLog ──────────────────────────────────────────────────────
            builder.Entity<AuditLog>()
                .HasOne(al => al.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // ── Worker ────────────────────────────────────────────────────────
            builder.Entity<Worker>()
                .HasOne(w => w.Venue)
                .WithMany(v => v.Workers)
                .HasForeignKey(w => w.VenueId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Worker>()
                .Property(w => w.DailySalary)
                .HasPrecision(18, 2);

            // ── Attendance ────────────────────────────────────────────────────
            builder.Entity<Attendance>()
                .HasOne(a => a.Worker)
                .WithMany(w => w.Attendances)
                .HasForeignKey(a => a.WorkerId)
                .OnDelete(DeleteBehavior.Cascade);

            // One attendance record per worker per day
            builder.Entity<Attendance>()
                .HasIndex(a => new { a.WorkerId, a.Date })
                .IsUnique();

            // ── ApplicationUser → Venue (Manager scoping) ────────────────────
            builder.Entity<ApplicationUser>()
                .HasOne(u => u.Venue)
                .WithMany()
                .HasForeignKey(u => u.VenueId)
                .OnDelete(DeleteBehavior.SetNull);

            // ── Venue decimal ─────────────────────────────────────────────────
            builder.Entity<Venue>()
                .Property(v => v.PricePerHour)
                .HasPrecision(18, 2);
        }
    }
}
