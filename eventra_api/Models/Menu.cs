using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class Menu
    {
        public int Id { get; set; }

        public int? TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        // Menus belong to a Marque (Venue), not to individual events
        [Required]
        public int VenueId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Category { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Range(0, 999999.99)]
        public decimal PricePerPerson { get; set; }

        public int MinimumGuests { get; set; } = 1;

        public bool IsVegetarian { get; set; } = false;

        public bool IsVegan { get; set; } = false;

        public bool IsGlutenFree { get; set; } = false;

        [MaxLength(500)]
        public string? AllergenInfo { get; set; }

        public bool IsAvailable { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Venue Venue { get; set; } = null!;
        public ICollection<EventMenu> EventMenus { get; set; } = new List<EventMenu>();
    }
}
