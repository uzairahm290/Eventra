using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    // DTO for creating a booking
    public class CreateBookingDto
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        [Range(1, 100)]
        public int NumberOfTickets { get; set; }

        [MaxLength(1000)]
        public string? SpecialRequests { get; set; }
    }

    // DTO for booking response
    public class BookingDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string BookingReference { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int NumberOfTickets { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AmountPaid { get; set; }
        public bool IsCheckedIn { get; set; }
        public string? QRCode { get; set; }
    }

    // DTO for payment
    public class ProcessPaymentDto
    {
        [Required]
        public int BookingId { get; set; }

        [Required]
        [Range(0.01, 999999.99)]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(100)]
        public string PaymentMethod { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? TransactionId { get; set; }
    }
}
