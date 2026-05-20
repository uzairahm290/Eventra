using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eventra_api.Models
{
    public enum WorkerType
    {
        Waiter,
        Sweeper,
        Accountant,
        Cook,
        Security,
        Driver,
        Cleaner,
        Other
    }

    public class Worker
    {
        [Key]
        public int Id { get; set; }

        public int? TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public WorkerType Type { get; set; } = WorkerType.Other;

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? CNIC { get; set; }

        [Required]
        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DailySalary { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public int VenueId { get; set; }

        [ForeignKey(nameof(VenueId))]
        public virtual Venue? Venue { get; set; }

        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
