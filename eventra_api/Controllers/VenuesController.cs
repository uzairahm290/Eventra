using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VenuesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Venues
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VenueDto>>> GetVenues([FromQuery] bool includeInactive = false)
        {
            var query = _context.Venues.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(v => v.IsActive);
            }

            var venues = await query
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City,
                    State = v.State,
                    PostalCode = v.PostalCode,
                    Capacity = v.Capacity,
                    Description = v.Description,
                    ContactPhone = v.ContactPhone,
                    ContactEmail = v.ContactEmail,
                    PricePerHour = v.PricePerHour,
                    IsActive = v.IsActive,
                    EventCount = v.Events.Count
                })
                .ToListAsync();

            return Ok(venues);
        }

        // GET: api/Venues/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VenueDto>> GetVenue(int id)
        {
            var venue = await _context.Venues
                .Include(v => v.Events)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound(new { message = "Venue not found." });
            }

            var venueDto = new VenueDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Address = venue.Address,
                City = venue.City,
                State = venue.State,
                PostalCode = venue.PostalCode,
                Capacity = venue.Capacity,
                Description = venue.Description,
                ContactPhone = venue.ContactPhone,
                ContactEmail = venue.ContactEmail,
                PricePerHour = venue.PricePerHour,
                IsActive = venue.IsActive,
                EventCount = venue.Events.Count
            };

            return Ok(venueDto);
        }

        // POST: api/Venues
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<VenueDto>> CreateVenue(CreateVenueDto createDto)
        {
            var venue = new Venue
            {
                Name = createDto.Name,
                Address = createDto.Address,
                City = createDto.City,
                State = createDto.State,
                PostalCode = createDto.PostalCode,
                Capacity = createDto.Capacity,
                Description = createDto.Description,
                ContactPhone = createDto.ContactPhone,
                ContactEmail = createDto.ContactEmail,
                PricePerHour = createDto.PricePerHour,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Venues.Add(venue);
            await _context.SaveChangesAsync();

            var venueDto = new VenueDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Address = venue.Address,
                City = venue.City,
                State = venue.State,
                PostalCode = venue.PostalCode,
                Capacity = venue.Capacity,
                Description = venue.Description,
                ContactPhone = venue.ContactPhone,
                ContactEmail = venue.ContactEmail,
                PricePerHour = venue.PricePerHour,
                IsActive = venue.IsActive,
                EventCount = 0
            };

            return CreatedAtAction(nameof(GetVenue), new { id = venue.Id }, venueDto);
        }

        // PUT: api/Venues/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVenue(int id, CreateVenueDto updateDto)
        {
            var venue = await _context.Venues.FindAsync(id);

            if (venue == null)
            {
                return NotFound(new { message = "Venue not found." });
            }

            venue.Name = updateDto.Name;
            venue.Address = updateDto.Address;
            venue.City = updateDto.City;
            venue.State = updateDto.State;
            venue.PostalCode = updateDto.PostalCode;
            venue.Capacity = updateDto.Capacity;
            venue.Description = updateDto.Description;
            venue.ContactPhone = updateDto.ContactPhone;
            venue.ContactEmail = updateDto.ContactEmail;
            venue.PricePerHour = updateDto.PricePerHour;
            venue.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await VenueExists(id))
                {
                    return NotFound(new { message = "Venue not found." });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Venues/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVenue(int id)
        {
            var venue = await _context.Venues
                .Include(v => v.Events)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound(new { message = "Venue not found." });
            }

            if (venue.Events.Any())
            {
                // Soft delete if there are associated events
                venue.IsActive = false;
                venue.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Venue deactivated (has associated events)." });
            }

            _context.Venues.Remove(venue);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> VenueExists(int id)
        {
            return await _context.Venues.AnyAsync(e => e.Id == id);
        }
    }
}
