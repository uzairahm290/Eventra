using System;
using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class Client
    {
        public int Id { get; set; }

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

        public bool IsActive { get; set; } = true;
    }
}
