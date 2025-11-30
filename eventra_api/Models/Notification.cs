using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public enum NotificationType
    {
        EventReminder,
        EventUpdate,
        EventCancellation,
        RegistrationConfirmation,
        PaymentConfirmation,
        BookingCancelled,
        NewEventCreated,
        SystemAnnouncement
    }

    public class Notification
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public NotificationType Type { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public int? EventId { get; set; }

        public int? BookingId { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        // Navigation properties
        public ApplicationUser User { get; set; } = null!;
        public Event? Event { get; set; }
        public Booking? Booking { get; set; }
    }
}
