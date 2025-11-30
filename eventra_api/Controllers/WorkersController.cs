using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;

namespace eventra_api.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class WorkersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Workers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkerDto>>> GetWorkers()
        {
            var workers = await _context.Workers
                .Include(w => w.Venue)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new WorkerDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Phone = w.Phone,
                    Address = w.Address,
                    VenueId = w.VenueId,
                    VenueName = w.Venue != null ? w.Venue.Name : null,
                    CreatedAt = w.CreatedAt
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
                .Where(w => w.Id == id)
                .Select(w => new WorkerDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Phone = w.Phone,
                    Address = w.Address,
                    VenueId = w.VenueId,
                    VenueName = w.Venue != null ? w.Venue.Name : null,
                    CreatedAt = w.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (worker == null)
            {
                return NotFound(new { message = "Worker not found." });
            }

            return Ok(worker);
        }

        // GET: api/Workers/venue/5
        [HttpGet("venue/{venueId}")]
        public async Task<ActionResult<IEnumerable<WorkerDto>>> GetWorkersByVenue(int venueId)
        {
            var workers = await _context.Workers
                .Include(w => w.Venue)
                .Where(w => w.VenueId == venueId)
                .OrderBy(w => w.Name)
                .Select(w => new WorkerDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Phone = w.Phone,
                    Address = w.Address,
                    VenueId = w.VenueId,
                    VenueName = w.Venue != null ? w.Venue.Name : null,
                    CreatedAt = w.CreatedAt
                })
                .ToListAsync();

            return Ok(workers);
        }

        // POST: api/Workers
        [HttpPost]
        public async Task<ActionResult<WorkerDto>> CreateWorker(CreateWorkerDto createDto)
        {
            // Check if venue exists
            var venueExists = await _context.Venues.AnyAsync(v => v.Id == createDto.VenueId);
            if (!venueExists)
            {
                return BadRequest(new { message = "Venue not found." });
            }

            var worker = new Worker
            {
                Name = createDto.Name,
                Phone = createDto.Phone,
                Address = createDto.Address,
                VenueId = createDto.VenueId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Workers.Add(worker);
            await _context.SaveChangesAsync();

            // Load venue name for response
            await _context.Entry(worker).Reference(w => w.Venue).LoadAsync();

            var workerDto = new WorkerDto
            {
                Id = worker.Id,
                Name = worker.Name,
                Phone = worker.Phone,
                Address = worker.Address,
                VenueId = worker.VenueId,
                VenueName = worker.Venue?.Name,
                CreatedAt = worker.CreatedAt
            };

            return CreatedAtAction(nameof(GetWorker), new { id = worker.Id }, workerDto);
        }

        // PUT: api/Workers/5
        [HttpPut("{id}")]
        public async Task<ActionResult<WorkerDto>> UpdateWorker(int id, UpdateWorkerDto updateDto)
        {
            var worker = await _context.Workers.FindAsync(id);

            if (worker == null)
            {
                return NotFound(new { message = "Worker not found." });
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                worker.Name = updateDto.Name;
            }

            if (!string.IsNullOrEmpty(updateDto.Phone))
            {
                worker.Phone = updateDto.Phone;
            }

            if (!string.IsNullOrEmpty(updateDto.Address))
            {
                worker.Address = updateDto.Address;
            }

            if (updateDto.VenueId.HasValue)
            {
                // Check if venue exists
                var venueExists = await _context.Venues.AnyAsync(v => v.Id == updateDto.VenueId.Value);
                if (!venueExists)
                {
                    return BadRequest(new { message = "Venue not found." });
                }
                worker.VenueId = updateDto.VenueId.Value;
            }

            worker.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkerExists(id))
                {
                    return NotFound(new { message = "Worker not found." });
                }
                throw;
            }

            // Load venue name for response
            await _context.Entry(worker).Reference(w => w.Venue).LoadAsync();

            var workerDto = new WorkerDto
            {
                Id = worker.Id,
                Name = worker.Name,
                Phone = worker.Phone,
                Address = worker.Address,
                VenueId = worker.VenueId,
                VenueName = worker.Venue?.Name,
                CreatedAt = worker.CreatedAt
            };

            return Ok(workerDto);
        }

        // DELETE: api/Workers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorker(int id)
        {
            var worker = await _context.Workers.FindAsync(id);

            if (worker == null)
            {
                return NotFound(new { message = "Worker not found." });
            }

            _context.Workers.Remove(worker);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Worker deleted successfully." });
        }

        private bool WorkerExists(int id)
        {
            return _context.Workers.Any(e => e.Id == id);
        }
    }
}
