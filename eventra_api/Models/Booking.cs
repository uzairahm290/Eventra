using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eventra_api.Models
{
    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Cancelled,
        Completed,
        Refunded
    }

    public class Booking
    {
        public int Id { get; set; }

        public int? TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        [Required]
        public int EventId { get; set; }

        // Client who is booking (external person — no system login)
        [Required]
        public int ClientId { get; set; }

        // Hall where the event/booking takes place
        public int? HallId { get; set; }

        [Required]
        [MaxLength(100)]
        public string BookingReference { get; set; } = string.Empty;

        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        public int NumberOfGuests { get; set; } = 1;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DepositAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountPaid { get; set; } = 0;

        public DateTime? PaymentDate { get; set; }

        [MaxLength(100)]
        public string? PaymentMethod { get; set; }

        [MaxLength(200)]
        public string? TransactionId { get; set; }

        public bool IsCheckedIn { get; set; } = false;

        public DateTime? CheckInTime { get; set; }

        [MaxLength(1000)]
        public string? SpecialRequests { get; set; }

        [MaxLength(1000)]
        public string? CancellationReason { get; set; }

        public DateTime? CancellationDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsApprovedByAdmin { get; set; } = false;

        // Who created this booking (system user — Owner or Manager)
        public string? CreatedByUserId { get; set; }

        // Navigation properties
        public Event Event { get; set; } = null!;
        public Client Client { get; set; } = null!;
        public Hall? Hall { get; set; }
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
