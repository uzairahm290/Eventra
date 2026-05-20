using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class CreateMenuDto
    {
        [Required]
        public int VenueId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Category { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [Range(0, 999999.99)]
        public decimal PricePerPerson { get; set; }

        public int MinimumGuests { get; set; } = 1;

        public bool IsVegetarian { get; set; } = false;
        public bool IsVegan { get; set; } = false;
        public bool IsGlutenFree { get; set; } = false;

        [MaxLength(500)]
        public string? AllergenInfo { get; set; }
    }

    public class MenuDto
    {
        public int Id { get; set; }
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public decimal PricePerPerson { get; set; }
        public int MinimumGuests { get; set; }
        public bool IsVegetarian { get; set; }
        public bool IsVegan { get; set; }
        public bool IsGlutenFree { get; set; }
        public string? AllergenInfo { get; set; }
        public bool IsAvailable { get; set; }
    }

    // Assign menus from a Marque's catalog to a specific event
    public class AssignMenusDto
    {
        public List<int> MenuIds { get; set; } = new List<int>();
        public int? GuestCount { get; set; }
    }
}
