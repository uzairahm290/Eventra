using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public enum AuditAction
    {
        Create,
        Update,
        Delete,
        Login,
        Logout,
        Registration,
        BookingCreated,
        BookingCancelled,
        CheckIn,
        PaymentReceived
    }

    public class AuditLog
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; } = string.Empty; // e.g., "Event", "Booking", "User"

        [Required]
        [MaxLength(100)]
        public string EntityId { get; set; } = string.Empty;

        [Required]
        public AuditAction Action { get; set; }

        public string? UserId { get; set; }

        [MaxLength(100)]
        public string? UserEmail { get; set; }

        [MaxLength(1000)]
        public string? Details { get; set; } // JSON or description of changes

        [MaxLength(50)]
        public string? IpAddress { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ApplicationUser? User { get; set; }
    }
}
