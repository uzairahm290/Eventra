namespace eventra_api.Models
{
    // DTO for notification response
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int? EventId { get; set; }
        public string? EventTitle { get; set; }
        public int? BookingId { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ActionUrl { get; set; }
    }

    // DTO for marking notification as read
    public class MarkNotificationReadDto
    {
        public int NotificationId { get; set; }
    }
}
