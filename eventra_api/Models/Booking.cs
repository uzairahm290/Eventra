using System.ComponentModel.DataAnnotations;

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

        [Required]
        public int EventId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string BookingReference { get; set; } = string.Empty;

        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        public int NumberOfTickets { get; set; } = 1;

        [Range(0, 999999.99)]
        public decimal TotalAmount { get; set; }

        [Range(0, 999999.99)]
        public decimal AmountPaid { get; set; } = 0;

        public DateTime? PaymentDate { get; set; }

        [MaxLength(100)]
        public string? PaymentMethod { get; set; }

        [MaxLength(200)]
        public string? TransactionId { get; set; }

        [MaxLength(500)]
        public string? QRCode { get; set; } // For check-in

        public bool IsCheckedIn { get; set; } = false;

        public DateTime? CheckInTime { get; set; }

        [MaxLength(1000)]
        public string? SpecialRequests { get; set; }

        [MaxLength(1000)]
        public string? CancellationReason { get; set; }

        public DateTime? CancellationDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsApprovedByAdmin { get; set; } = false; // Requires admin approval

        // Navigation properties
        public Event Event { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
