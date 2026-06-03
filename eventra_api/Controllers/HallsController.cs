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
    public class HallsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HallsController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetScopedVenueId()
        {
            var claim = User.FindFirstValue("VenueId");
            return int.TryParse(claim, out var v) ? v : null;
        }

        // GET: api/Halls
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HallDto>>> GetAllHalls([FromQuery] int? venueId = null)
        {
            var scopedVenueId = GetScopedVenueId() ?? venueId;

            var query = _context.Halls
                .Include(h => h.Venue)
                .AsQueryable();

            if (scopedVenueId.HasValue)
                query = query.Where(h => h.VenueId == scopedVenueId.Value);

            var halls = await query
                .OrderBy(h => h.Venue.Name).ThenBy(h => h.Name)
                .Select(h => new HallDto
                {
                    Id = h.Id,
                    VenueId = h.VenueId,
                    VenueName = h.Venue.Name,
                    Name = h.Name,
                    Capacity = h.Capacity,
                    Description = h.Description,
                    PricePerHour = h.PricePerHour,
                    IsActive = h.IsActive,
                    EventCount = h.Events.Count
                })
                .ToListAsync();

            return Ok(halls);
        }

        // GET: api/Halls/venue/5
        [HttpGet("venue/{venueId}")]
        public async Task<ActionResult<IEnumerable<HallDto>>> GetVenueHalls(int venueId)
        {
            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && scopedVenueId.Value != venueId)
                return Forbid();

            var halls = await _context.Halls
                .Include(h => h.Venue)
                .Where(h => h.VenueId == venueId && h.IsActive)
                .Select(h => new HallDto
                {
                    Id = h.Id,
                    VenueId = h.VenueId,
                    VenueName = h.Venue.Name,
                    Name = h.Name,
                    Capacity = h.Capacity,
                    Description = h.Description,
                    PricePerHour = h.PricePerHour,
                    IsActive = h.IsActive,
                    EventCount = h.Events.Count
                })
                .ToListAsync();

            return Ok(halls);
        }

        // GET: api/Halls/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HallDto>> GetHall(int id)
        {
            var hall = await _context.Halls
                .Include(h => h.Venue)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (hall == null)
                return NotFound(new { message = "Hall not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && hall.VenueId != scopedVenueId.Value)
                return Forbid();

            return Ok(new HallDto
            {
                Id = hall.Id,
                VenueId = hall.VenueId,
                VenueName = hall.Venue.Name,
                Name = hall.Name,
                Capacity = hall.Capacity,
                Description = hall.Description,
                PricePerHour = hall.PricePerHour,
                IsActive = hall.IsActive,
                EventCount = hall.Events.Count
            });
        }

        // GET: api/Halls/5/availability?startDate=&endDate=
        [HttpGet("{id}/availability")]
        public async Task<IActionResult> CheckAvailability(int id, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var hall = await _context.Halls.FindAsync(id);
            if (hall == null)
                return NotFound(new { message = "Hall not found." });

            var conflictingBookings = await _context.Bookings
                .Include(b => b.Event)
                .Where(b => b.HallId == id
                    && b.Status != BookingStatus.Cancelled
                    && (startDate == null || b.Event.Date.Date <= (endDate ?? startDate.Value).Date)
                    && (endDate == null || b.Event.EndDate == null || b.Event.EndDate.Value.Date >= startDate!.Value.Date))
                .Select(b => new
                {
                    b.Id,
                    b.BookingReference,
                    eventTitle = b.Event.Title,
                    eventDate = b.Event.Date,
                    eventEndDate = b.Event.EndDate,
                    status = b.Status.ToString()
                })
                .ToListAsync();

            return Ok(new
            {
                isAvailable = !conflictingBookings.Any(),
                conflicts = conflictingBookings
            });
        }

        // POST: api/Halls
        [HttpPost]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<ActionResult<HallDto>> CreateHall(CreateHallDto createDto)
        {
            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && scopedVenueId.Value != createDto.VenueId)
                return Forbid();

            var venue = await _context.Venues.FindAsync(createDto.VenueId);
            if (venue == null)
                return NotFound(new { message = "Marque not found." });

            var hall = new Hall
            {
                VenueId = createDto.VenueId,
                Name = createDto.Name,
                Capacity = createDto.Capacity,
                Description = createDto.Description,
                PricePerHour = createDto.PricePerHour,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Halls.Add(hall);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHall), new { id = hall.Id }, new HallDto
            {
                Id = hall.Id,
                VenueId = hall.VenueId,
                VenueName = venue.Name,
                Name = hall.Name,
                Capacity = hall.Capacity,
                Description = hall.Description,
                PricePerHour = hall.PricePerHour,
                IsActive = hall.IsActive,
                EventCount = 0
            });
        }

        // PUT: api/Halls/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> UpdateHall(int id, UpdateHallDto updateDto)
        {
            var hall = await _context.Halls.FindAsync(id);
            if (hall == null)
                return NotFound(new { message = "Hall not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && hall.VenueId != scopedVenueId.Value)
                return Forbid();

            if (updateDto.Name != null) hall.Name = updateDto.Name;
            if (updateDto.Capacity.HasValue) hall.Capacity = updateDto.Capacity.Value;
            if (updateDto.Description != null) hall.Description = updateDto.Description;
            if (updateDto.PricePerHour.HasValue) hall.PricePerHour = updateDto.PricePerHour;
            if (updateDto.IsActive.HasValue) hall.IsActive = updateDto.IsActive.Value;
            hall.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Halls/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> DeleteHall(int id)
        {
            var hall = await _context.Halls
                .Include(h => h.Bookings)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (hall == null)
                return NotFound(new { message = "Hall not found." });

            if (hall.Bookings.Any(b => b.Status != BookingStatus.Cancelled))
                return BadRequest(new { message = "Cannot delete hall with active bookings. Cancel bookings first." });

            _context.Halls.Remove(hall);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class HallDto
    {
        public int Id { get; set; }
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string? Description { get; set; }
        public decimal? PricePerHour { get; set; }
        public bool IsActive { get; set; }
        public int EventCount { get; set; }
    }

    public class CreateHallDto
    {
        [Required]
        public int VenueId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(1, 100000)]
        public int Capacity { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public decimal? PricePerHour { get; set; }
    }

    public class UpdateHallDto
    {
        [MaxLength(200)]
        public string? Name { get; set; }

        [Range(1, 100000)]
        public int? Capacity { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public decimal? PricePerHour { get; set; }
        public bool? IsActive { get; set; }
    }
}
