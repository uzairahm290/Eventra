using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    // DTO for registering for an event
    public class RegisterEventDto
    {
        [Required]
        public int EventId { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public bool PaymentRequired { get; set; } = false;
    }

    // DTO for attendee response
    public class EventAttendeeDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public DateTime RegistrationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? CheckInTime { get; set; }
        public bool PaymentCompleted { get; set; }
    }
}
