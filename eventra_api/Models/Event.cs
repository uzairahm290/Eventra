using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class Event
    {
        public int Id { get; set; }

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

        [Range(1, 100000)]
        public int MaxAttendees { get; set; }

        public int CurrentAttendees { get; set; } = 0;

        public EventCategory Category { get; set; } = EventCategory.Other;

        public EventStatus Status { get; set; } = EventStatus.Draft;

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

        [Required]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Venue? Venue { get; set; }
        public ApplicationUser Creator { get; set; } = null!;
        public ICollection<EventAttendee> Attendees { get; set; } = new List<EventAttendee>();
        public ICollection<Menu> Menus { get; set; } = new List<Menu>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}