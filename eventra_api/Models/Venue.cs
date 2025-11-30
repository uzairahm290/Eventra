using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class Venue
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [Range(1, 100000)]
        public int Capacity { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? ContactPhone { get; set; }

        [EmailAddress]
        [MaxLength(100)]
        public string? ContactEmail { get; set; }

        public decimal? PricePerHour { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public ICollection<Event> Events { get; set; } = new List<Event>();
    }
}
