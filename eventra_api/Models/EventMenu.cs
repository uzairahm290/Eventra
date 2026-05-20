using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    // Junction table for Event ↔ Menu many-to-many relationship
    public class EventMenu
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        public int MenuId { get; set; }

        public int? GuestCount { get; set; }

        // Navigation
        public virtual Event Event { get; set; } = null!;
        public virtual Menu Menu { get; set; } = null!;
    }
}
