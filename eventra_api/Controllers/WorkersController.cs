using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;
using System.Security.Claims;

namespace eventra_api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class WorkersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkersController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetScopedVenueId()
        {
            var claim = User.FindFirstValue("VenueId");
            return int.TryParse(claim, out var v) ? v : null;
        }

        private static WorkerDto MapToDto(Worker w) => new WorkerDto
        {
            Id = w.Id,
            Name = w.Name,
            Type = w.Type.ToString(),
            Phone = w.Phone,
            CNIC = w.CNIC,
            Address = w.Address,
            DailySalary = w.DailySalary,
            IsActive = w.IsActive,
            VenueId = w.VenueId,
            VenueName = w.Venue?.Name,
            CreatedAt = w.CreatedAt,
            UpdatedAt = w.UpdatedAt
        };

        // GET: api/Workers?venueId=&type=
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkerDto>>> GetWorkers([FromQuery] int? venueId = null, [FromQuery] string? type = null)
        {
            var scopedVenueId = GetScopedVenueId() ?? venueId;

            var query = _context.Workers.Include(w => w.Venue).AsQueryable();

            if (scopedVenueId.HasValue)
                query = query.Where(w => w.VenueId == scopedVenueId.Value);

            if (!string.IsNullOrEmpty(type) && Enum.TryParse<WorkerType>(type, true, out var workerType))
                query = query.Where(w => w.Type == workerType);

            var workers = await query
                .OrderBy(w => w.Venue!.Name).ThenBy(w => w.Name)
                .Select(w => new WorkerDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Type = w.Type.ToString(),
                    Phone = w.Phone,
                    CNIC = w.CNIC,
                    Address = w.Address,
                    DailySalary = w.DailySalary,
                    IsActive = w.IsActive,
                    VenueId = w.VenueId,
                    VenueName = w.Venue != null ? w.Venue.Name : null,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = w.UpdatedAt
                })
                .ToListAsync();

            return Ok(workers);
        }

        // GET: api/Workers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkerDto>> GetWorker(int id)
        {
            var worker = await _context.Workers
                .Include(w => w.Venue)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (worker == null)
                return NotFound(new { message = "Worker not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && worker.VenueId != scopedVenueId.Value)
                return Forbid();

            return Ok(MapToDto(worker));
        }

        // GET: api/Workers/venue/5
        [HttpGet("venue/{venueId}")]
        public async Task<ActionResult<IEnumerable<WorkerDto>>> GetWorkersByVenue(int venueId)
        {
            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && scopedVenueId.Value != venueId)
                return Forbid();

            var workers = await _context.Workers
                .Include(w => w.Venue)
                .Where(w => w.VenueId == venueId)
                .OrderBy(w => w.Name)
                .Select(w => new WorkerDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Type = w.Type.ToString(),
                    Phone = w.Phone,
                    CNIC = w.CNIC,
                    Address = w.Address,
                    DailySalary = w.DailySalary,
                    IsActive = w.IsActive,
                    VenueId = w.VenueId,
                    VenueName = w.Venue != null ? w.Venue.Name : null,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = w.UpdatedAt
                })
                .ToListAsync();

            return Ok(workers);
        }

        // POST: api/Workers
        [HttpPost]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<ActionResult<WorkerDto>> CreateWorker(CreateWorkerDto createDto)
        {
            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && scopedVenueId.Value != createDto.VenueId)
                return Forbid();

            var venueExists = await _context.Venues.AnyAsync(v => v.Id == createDto.VenueId);
            if (!venueExists)
                return NotFound(new { message = "Marque not found." });

            var worker = new Worker
            {
                Name = createDto.Name,
                Type = createDto.Type,
                Phone = createDto.Phone,
                CNIC = createDto.CNIC,
                Address = createDto.Address,
                DailySalary = createDto.DailySalary,
                VenueId = createDto.VenueId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Workers.Add(worker);
            await _context.SaveChangesAsync();

            await _context.Entry(worker).Reference(w => w.Venue).LoadAsync();
            return CreatedAtAction(nameof(GetWorker), new { id = worker.Id }, MapToDto(worker));
        }

        // PUT: api/Workers/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<ActionResult<WorkerDto>> UpdateWorker(int id, UpdateWorkerDto updateDto)
        {
            var worker = await _context.Workers.Include(w => w.Venue).FirstOrDefaultAsync(w => w.Id == id);
            if (worker == null)
                return NotFound(new { message = "Worker not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && worker.VenueId != scopedVenueId.Value)
                return Forbid();

            if (updateDto.Name != null) worker.Name = updateDto.Name;
            if (updateDto.Type.HasValue) worker.Type = updateDto.Type.Value;
            if (updateDto.Phone != null) worker.Phone = updateDto.Phone;
            if (updateDto.CNIC != null) worker.CNIC = updateDto.CNIC;
            if (updateDto.Address != null) worker.Address = updateDto.Address;
            if (updateDto.DailySalary.HasValue) worker.DailySalary = updateDto.DailySalary;
            if (updateDto.IsActive.HasValue) worker.IsActive = updateDto.IsActive.Value;

            if (updateDto.VenueId.HasValue)
            {
                if (scopedVenueId.HasValue)
                    return Forbid(); // Manager cannot reassign a worker to a different Marque

                var venueExists = await _context.Venues.AnyAsync(v => v.Id == updateDto.VenueId.Value);
                if (!venueExists)
                    return NotFound(new { message = "Marque not found." });

                worker.VenueId = updateDto.VenueId.Value;
            }

            worker.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _context.Entry(worker).Reference(w => w.Venue).LoadAsync();
            return Ok(MapToDto(worker));
        }

        // DELETE: api/Workers/5 — soft delete to preserve attendance history
        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> DeleteWorker(int id)
        {
            var worker = await _context.Workers.FindAsync(id);
            if (worker == null)
                return NotFound(new { message = "Worker not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && worker.VenueId != scopedVenueId.Value)
                return Forbid();

            worker.IsActive = false;
            worker.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Worker deactivated." });
        }

        private bool WorkerExists(int id) => _context.Workers.Any(e => e.Id == id);
    }
}
