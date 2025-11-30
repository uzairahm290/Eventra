using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    // DTO for creating a menu
    public class CreateMenuDto
    {
        [Required]
        public int EventId { get; set; }

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

    // DTO for menu response
    public class MenuDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
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
}
