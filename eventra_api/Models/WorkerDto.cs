using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class CreateWorkerDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        [Required]
        public int VenueId { get; set; }
    }

    public class WorkerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateWorkerDto
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(300)]
        public string? Address { get; set; }

        public int? VenueId { get; set; }
    }
}
