using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetScopedVenueId()
        {
            var claim = User.FindFirstValue("VenueId");
            return int.TryParse(claim, out var v) ? v : null;
        }

        // GET: api/Attendance?venueId=&date=&workerId=
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendanceDto>>> GetAttendance(
            [FromQuery] int? venueId = null,
            [FromQuery] DateOnly? date = null,
            [FromQuery] int? workerId = null)
        {
            var scopedVenueId = GetScopedVenueId() ?? venueId;

            var query = _context.Attendances
                .Include(a => a.Worker).ThenInclude(w => w.Venue)
                .AsQueryable();

            if (scopedVenueId.HasValue)
                query = query.Where(a => a.Worker.VenueId == scopedVenueId.Value);

            if (date.HasValue)
                query = query.Where(a => a.Date == date.Value);

            if (workerId.HasValue)
                query = query.Where(a => a.WorkerId == workerId.Value);

            var records = await query
                .OrderByDescending(a => a.Date)
                .ThenBy(a => a.Worker.Name)
                .Select(a => new AttendanceDto
                {
                    Id = a.Id,
                    WorkerId = a.WorkerId,
                    WorkerName = a.Worker.Name,
                    WorkerType = a.Worker.Type.ToString(),
                    VenueId = a.Worker.VenueId,
                    VenueName = a.Worker.Venue != null ? a.Worker.Venue.Name : null,
                    Date = a.Date.ToString("yyyy-MM-dd"),
                    Status = a.Status.ToString(),
                    Notes = a.Notes,
                    CheckInTime = a.CheckInTime.HasValue ? a.CheckInTime.Value.ToString("HH:mm") : null,
                    CheckOutTime = a.CheckOutTime.HasValue ? a.CheckOutTime.Value.ToString("HH:mm") : null,
                    MarkedBy = a.MarkedBy
                })
                .ToListAsync();

            return Ok(records);
        }

        // GET: api/Attendance/worker/5
        [HttpGet("worker/{workerId}")]
        public async Task<ActionResult<IEnumerable<AttendanceDto>>> GetWorkerAttendance(int workerId)
        {
            var worker = await _context.Workers.FindAsync(workerId);
            if (worker == null)
                return NotFound(new { message = "Worker not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && worker.VenueId != scopedVenueId.Value)
                return Forbid();

            var records = await _context.Attendances
                .Include(a => a.Worker).ThenInclude(w => w.Venue)
                .Where(a => a.WorkerId == workerId)
                .OrderByDescending(a => a.Date)
                .Select(a => new AttendanceDto
                {
                    Id = a.Id,
                    WorkerId = a.WorkerId,
                    WorkerName = a.Worker.Name,
                    WorkerType = a.Worker.Type.ToString(),
                    VenueId = a.Worker.VenueId,
                    Date = a.Date.ToString("yyyy-MM-dd"),
                    Status = a.Status.ToString(),
                    Notes = a.Notes,
                    CheckInTime = a.CheckInTime.HasValue ? a.CheckInTime.Value.ToString("HH:mm") : null,
                    CheckOutTime = a.CheckOutTime.HasValue ? a.CheckOutTime.Value.ToString("HH:mm") : null
                })
                .ToListAsync();

            return Ok(records);
        }

        // GET: api/Attendance/venue/5/date/2026-01-15
        [HttpGet("venue/{venueId}/date/{dateStr}")]
        public async Task<ActionResult<IEnumerable<AttendanceDto>>> GetVenueDayAttendance(int venueId, string dateStr)
        {
            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && scopedVenueId.Value != venueId)
                return Forbid();

            if (!DateOnly.TryParse(dateStr, out var date))
                return BadRequest(new { message = "Invalid date format. Use yyyy-MM-dd." });

            // Load all workers for this venue (for the full list including those without attendance)
            var workers = await _context.Workers
                .Where(w => w.VenueId == venueId && w.IsActive)
                .ToListAsync();

            var existingRecords = await _context.Attendances
                .Where(a => a.Worker.VenueId == venueId && a.Date == date)
                .ToListAsync();

            var result = workers.Select(w =>
            {
                var record = existingRecords.FirstOrDefault(a => a.WorkerId == w.Id);
                return new AttendanceDto
                {
                    Id = record?.Id ?? 0,
                    WorkerId = w.Id,
                    WorkerName = w.Name,
                    WorkerType = w.Type.ToString(),
                    VenueId = venueId,
                    Date = date.ToString("yyyy-MM-dd"),
                    Status = record?.Status.ToString() ?? "NotMarked",
                    Notes = record?.Notes,
                    CheckInTime = record?.CheckInTime?.ToString("HH:mm"),
                    CheckOutTime = record?.CheckOutTime?.ToString("HH:mm")
                };
            }).ToList();

            return Ok(result);
        }

        // GET: api/Attendance/summary?venueId=&month=2026-06
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] int? venueId = null, [FromQuery] string? month = null)
        {
            var scopedVenueId = GetScopedVenueId() ?? venueId;

            int year = DateTime.UtcNow.Year;
            int mo = DateTime.UtcNow.Month;
            if (!string.IsNullOrEmpty(month) && month.Length == 7)
            {
                year = int.Parse(month[..4]);
                mo = int.Parse(month[5..]);
            }

            var startDate = new DateOnly(year, mo, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var query = _context.Attendances
                .Include(a => a.Worker)
                .Where(a => a.Date >= startDate && a.Date <= endDate)
                .AsQueryable();

            if (scopedVenueId.HasValue)
                query = query.Where(a => a.Worker.VenueId == scopedVenueId.Value);

            var records = await query.ToListAsync();
            var workers = await _context.Workers
                .Where(w => (!scopedVenueId.HasValue || w.VenueId == scopedVenueId.Value) && w.IsActive)
                .ToListAsync();

            var totalDays = (endDate.DayNumber - startDate.DayNumber) + 1;

            var summary = workers.Select(w =>
            {
                var workerRecords = records.Where(a => a.WorkerId == w.Id).ToList();
                return new
                {
                    workerId = w.Id,
                    workerName = w.Name,
                    workerType = w.Type.ToString(),
                    present = workerRecords.Count(a => a.Status == AttendanceStatus.Present),
                    absent = workerRecords.Count(a => a.Status == AttendanceStatus.Absent),
                    halfDay = workerRecords.Count(a => a.Status == AttendanceStatus.HalfDay),
                    leave = workerRecords.Count(a => a.Status == AttendanceStatus.Leave),
                    total = workerRecords.Count,
                    attendanceRate = workerRecords.Count > 0
                        ? Math.Round((double)workerRecords.Count(a => a.Status == AttendanceStatus.Present) / totalDays * 100, 1)
                        : 0.0
                };
            }).ToList();

            return Ok(new { month = $"{year}-{mo:D2}", totalDays, summary });
        }

        // POST: api/Attendance
        [HttpPost]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<ActionResult<AttendanceDto>> MarkAttendance(MarkAttendanceDto dto)
        {
            var worker = await _context.Workers.Include(w => w.Venue).FirstOrDefaultAsync(w => w.Id == dto.WorkerId);
            if (worker == null)
                return NotFound(new { message = "Worker not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && worker.VenueId != scopedVenueId.Value)
                return Forbid();

            if (!DateOnly.TryParse(dto.Date, out var date))
                return BadRequest(new { message = "Invalid date format. Use yyyy-MM-dd." });

            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.WorkerId == dto.WorkerId && a.Date == date);

            if (existing != null)
            {
                existing.Status = Enum.Parse<AttendanceStatus>(dto.Status);
                existing.Notes = dto.Notes;
                if (!string.IsNullOrEmpty(dto.CheckInTime)) existing.CheckInTime = TimeOnly.Parse(dto.CheckInTime);
                if (!string.IsNullOrEmpty(dto.CheckOutTime)) existing.CheckOutTime = TimeOnly.Parse(dto.CheckOutTime);
                existing.UpdatedAt = DateTime.UtcNow;
                existing.MarkedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
                await _context.SaveChangesAsync();
                return Ok(MapToDto(existing, worker));
            }

            var record = new Attendance
            {
                WorkerId = dto.WorkerId,
                Date = date,
                Status = Enum.Parse<AttendanceStatus>(dto.Status),
                Notes = dto.Notes,
                CheckInTime = string.IsNullOrEmpty(dto.CheckInTime) ? null : TimeOnly.Parse(dto.CheckInTime),
                CheckOutTime = string.IsNullOrEmpty(dto.CheckOutTime) ? null : TimeOnly.Parse(dto.CheckOutTime),
                MarkedBy = User.FindFirstValue(ClaimTypes.NameIdentifier),
                CreatedAt = DateTime.UtcNow
            };

            _context.Attendances.Add(record);
            await _context.SaveChangesAsync();

            return CreatedAtAction(null, MapToDto(record, worker));
        }

        // POST: api/Attendance/bulk
        [HttpPost("bulk")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> BulkMarkAttendance(BulkAttendanceDto dto)
        {
            var scopedVenueId = GetScopedVenueId();
            var markedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var results = new List<string>();

            foreach (var entry in dto.Entries)
            {
                var worker = await _context.Workers.FindAsync(entry.WorkerId);
                if (worker == null) { results.Add($"Worker {entry.WorkerId} not found"); continue; }
                if (scopedVenueId.HasValue && worker.VenueId != scopedVenueId.Value) continue;

                if (!DateOnly.TryParse(entry.Date, out var date)) continue;

                var existing = await _context.Attendances
                    .FirstOrDefaultAsync(a => a.WorkerId == entry.WorkerId && a.Date == date);

                if (existing != null)
                {
                    existing.Status = Enum.Parse<AttendanceStatus>(entry.Status);
                    existing.Notes = entry.Notes;
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.MarkedBy = markedBy;
                }
                else
                {
                    _context.Attendances.Add(new Attendance
                    {
                        WorkerId = entry.WorkerId,
                        Date = date,
                        Status = Enum.Parse<AttendanceStatus>(entry.Status),
                        Notes = entry.Notes,
                        MarkedBy = markedBy,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Attendance saved.", count = dto.Entries.Count });
        }

        // PUT: api/Attendance/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> UpdateAttendance(int id, MarkAttendanceDto dto)
        {
            var record = await _context.Attendances.Include(a => a.Worker).FirstOrDefaultAsync(a => a.Id == id);
            if (record == null)
                return NotFound(new { message = "Attendance record not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && record.Worker.VenueId != scopedVenueId.Value)
                return Forbid();

            record.Status = Enum.Parse<AttendanceStatus>(dto.Status);
            record.Notes = dto.Notes;
            if (!string.IsNullOrEmpty(dto.CheckInTime)) record.CheckInTime = TimeOnly.Parse(dto.CheckInTime);
            if (!string.IsNullOrEmpty(dto.CheckOutTime)) record.CheckOutTime = TimeOnly.Parse(dto.CheckOutTime);
            record.UpdatedAt = DateTime.UtcNow;
            record.MarkedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static AttendanceDto MapToDto(Attendance a, Worker w) => new AttendanceDto
        {
            Id = a.Id,
            WorkerId = a.WorkerId,
            WorkerName = w.Name,
            WorkerType = w.Type.ToString(),
            VenueId = w.VenueId,
            VenueName = w.Venue?.Name,
            Date = a.Date.ToString("yyyy-MM-dd"),
            Status = a.Status.ToString(),
            Notes = a.Notes,
            CheckInTime = a.CheckInTime?.ToString("HH:mm"),
            CheckOutTime = a.CheckOutTime?.ToString("HH:mm"),
            MarkedBy = a.MarkedBy
        };
    }

    public class AttendanceDto
    {
        public int Id { get; set; }
        public int WorkerId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public string WorkerType { get; set; } = string.Empty;
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public string Date { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? CheckInTime { get; set; }
        public string? CheckOutTime { get; set; }
        public string? MarkedBy { get; set; }
    }

    public class MarkAttendanceDto
    {
        [Required]
        public int WorkerId { get; set; }

        [Required]
        public string Date { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "Present";

        public string? Notes { get; set; }
        public string? CheckInTime { get; set; }
        public string? CheckOutTime { get; set; }
    }

    public class BulkAttendanceDto
    {
        [Required]
        public List<MarkAttendanceDto> Entries { get; set; } = new();
    }
}
