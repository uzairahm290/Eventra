using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public enum AttendeeStatus
    {
        Registered,
        CheckedIn,
        Cancelled,
        NoShow
    }

    public class EventAttendee
    {
        public int Id { get; set; }

        [Required]
        public int EventId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

        public AttendeeStatus Status { get; set; } = AttendeeStatus.Registered;

        public DateTime? CheckInTime { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public bool PaymentRequired { get; set; } = false;

        public bool PaymentCompleted { get; set; } = false;

        public DateTime? PaymentDate { get; set; }

        // Navigation properties
        public Event Event { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
