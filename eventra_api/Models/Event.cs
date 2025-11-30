using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace eventra_api.Models;

public partial class Event
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = null!;

    [Required]
    public DateTime Date { get; set; }

    public DateTime? EndDate { get; set; }

    [Required]
    [StringLength(300)]
    public string Location { get; set; } = null!;

    [Required]
    [StringLength(2000)]
    public string Description { get; set; } = null!;

    [Required]
    public int MaxAttendees { get; set; }

    public int CurrentAttendees { get; set; } = 0;

    [Required]
    public EventCategory Category { get; set; }

    [Required]
    public EventStatus Status { get; set; } = EventStatus.Draft;

    // Venue Information
    public int? VenueId { get; set; }
    public virtual Venue? Venue { get; set; }

    // Pricing
    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? TicketPrice { get; set; }

    public bool IsFree { get; set; } = false;

    // Registration Settings
    public bool RequiresApproval { get; set; } = false;
    public bool IsPublic { get; set; } = true;

    // Organizer Information
    [StringLength(100)]
    public string? OrganizerName { get; set; }

    [StringLength(100)]
    public string? OrganizerEmail { get; set; }

    [StringLength(50)]
    public string? OrganizerPhone { get; set; }

    // Audit Fields
    [Required]
    [StringLength(450)]
    public string CreatedBy { get; set; } = null!;

    public virtual ApplicationUser Creator { get; set; } = null!;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public virtual ICollection<EventAttendee> Attendees { get; set; } = new List<EventAttendee>();
    public virtual ICollection<Menu> Menus { get; set; } = new List<Menu>();
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
