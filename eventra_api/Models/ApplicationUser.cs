using Microsoft.AspNetCore.Identity;
using System;

namespace eventra_api.Models
{
    // ApplicationUser inherits from IdentityUser, giving it properties like UserName, Email, and PasswordHash
    public class ApplicationUser : IdentityUser
    {
        // Add custom properties here (e.g., for profile customization)
        public string FirstName { get; set; } = string.Empty;
        public string SecondName { get; set; } = string.Empty;
        public string? ProfileImageBase64 { get; set; }
        public DateTime DateRegistered { get; set; } = DateTime.Now;
        public DateTime? LastLoginAt { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsApproved { get; set; } = false; // Admin approval required

        public int? TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        // VenueId: null for Owner (sees all marques), set for Manager (scoped to one marque)
        public int? VenueId { get; set; }
        public Venue? Venue { get; set; }

        // Navigation properties
        public ICollection<Event> CreatedEvents { get; set; } = new List<Event>();
        public ICollection<EventAttendee> EventAttendees { get; set; } = new List<EventAttendee>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}