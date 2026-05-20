using System;
using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class Client
    {
        public int Id { get; set; }

        public int? TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string SecondName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(200)]
        public string? Company { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        public DateTime DateRegistered { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string? CNIC { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
