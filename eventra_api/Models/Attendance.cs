using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public enum AttendanceStatus
    {
        Present,
        Absent,
        HalfDay,
        Leave
    }

    public class Attendance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkerId { get; set; }

        public int? TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;

        [MaxLength(500)]
        public string? Notes { get; set; }

        public TimeOnly? CheckInTime { get; set; }
        public TimeOnly? CheckOutTime { get; set; }

        // UserId of who marked this attendance (Owner or Manager)
        [MaxLength(450)]
        public string? MarkedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual Worker Worker { get; set; } = null!;
    }
}
