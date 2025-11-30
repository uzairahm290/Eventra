using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public bool IsRevoked { get; set; } = false;

        public DateTime? RevokedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string? CreatedByIp { get; set; }

        [MaxLength(50)]
        public string? RevokedByIp { get; set; }

        [MaxLength(500)]
        public string? ReplacedByToken { get; set; }

        // Navigation property
        public ApplicationUser User { get; set; } = null!;
    }
}
