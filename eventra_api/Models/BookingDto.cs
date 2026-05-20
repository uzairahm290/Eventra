using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class CreateBookingDto
    {
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int EventId { get; set; }

        public int? HallId { get; set; }

        [Range(1, 10000)]
        public int NumberOfGuests { get; set; } = 1;

        [Range(0, 99999999.99)]
        public decimal TotalAmount { get; set; }

        [Range(0, 99999999.99)]
        public decimal DepositAmount { get; set; } = 0;

        [MaxLength(100)]
        public string? PaymentMethod { get; set; }

        [MaxLength(1000)]
        public string? SpecialRequests { get; set; }
    }

    public class BookingDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string? MarqueName { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? ClientPhone { get; set; }
        public string? ClientCNIC { get; set; }
        public int? HallId { get; set; }
        public string? HallName { get; set; }
        public string BookingReference { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int NumberOfGuests { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public decimal AmountPaid { get; set; }
        public string? PaymentMethod { get; set; }
        public bool IsCheckedIn { get; set; }
        public bool IsApprovedByAdmin { get; set; }
        public string? SpecialRequests { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ProcessPaymentDto
    {
        [Required]
        public int BookingId { get; set; }

        [Required]
        [Range(0.01, 99999999.99)]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(100)]
        public string PaymentMethod { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? TransactionId { get; set; }
    }
}
