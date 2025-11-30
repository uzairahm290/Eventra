using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    // Enhanced DTO for creating an event
    public class CreateEventDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        [MaxLength(300)]
        public string Location { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(1, 100000)]
        public int MaxAttendees { get; set; }

        public EventCategory Category { get; set; } = EventCategory.Other;

        public int? VenueId { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [Range(0, 999999.99)]
        public decimal? TicketPrice { get; set; }

        public bool IsFree { get; set; } = true;

        public bool RequiresApproval { get; set; } = false;

        public bool IsPublic { get; set; } = true;

        [MaxLength(100)]
        public string? OrganizerName { get; set; }

        [EmailAddress]
        [MaxLength(100)]
        public string? OrganizerEmail { get; set; }

        [MaxLength(50)]
        public string? OrganizerPhone { get; set; }
    }

    // Enhanced DTO for event response
    public class EventDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public DateTime? EndDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MaxAttendees { get; set; }
        public int CurrentAttendees { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? VenueId { get; set; }
        public string? VenueName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal? TicketPrice { get; set; }
        public bool IsFree { get; set; }
        public bool RequiresApproval { get; set; }
        public bool IsPublic { get; set; }
        public string? OrganizerName { get; set; }
        public string? OrganizerEmail { get; set; }
        public string? OrganizerPhone { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsUserRegistered { get; set; } = false;
        public bool HasAvailableSeats { get; set; } = true;
    }

    // DTO for updating event
    public class UpdateEventDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public DateTime? Date { get; set; }

        public DateTime? EndDate { get; set; }

        [MaxLength(300)]
        public string? Location { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(1, 100000)]
        public int? MaxAttendees { get; set; }

        public EventCategory? Category { get; set; }

        public EventStatus? Status { get; set; }

        public int? VenueId { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [Range(0, 999999.99)]
        public decimal? TicketPrice { get; set; }

        public bool? IsFree { get; set; }

        public bool? RequiresApproval { get; set; }

        public bool? IsPublic { get; set; }
    }
}
