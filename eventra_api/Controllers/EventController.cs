using eventra_api.Data;
using eventra_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public EventsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEvents(
            [FromQuery] EventCategory? category = null,
            [FromQuery] EventStatus? status = null,
            [FromQuery] bool upcoming = false)
        {
            var query = _context.Events
                .Include(e => e.Venue)
                .AsQueryable();

            if (category.HasValue)
            {
                query = query.Where(e => e.Category == category.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(e => e.Status == status.Value);
            }
            // Removed default Published-only filter to show all events in admin view

            if (upcoming)
            {
                query = query.Where(e => e.Date >= DateTime.UtcNow);
            }

            var events = await query
                .OrderBy(e => e.Date)
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Date = e.Date,
                    EndDate = e.EndDate,
                    Location = e.Location,
                    Description = e.Description,
                    MaxAttendees = e.MaxAttendees,
                    CurrentAttendees = e.CurrentAttendees,
                    Category = e.Category.ToString(),
                    Status = e.Status.ToString(),
                    VenueId = e.VenueId,
                    VenueName = e.Venue != null ? e.Venue.Name : null,
                    ImageUrl = e.ImageUrl,
                    TicketPrice = e.TicketPrice,
                    IsFree = e.IsFree,
                    RequiresApproval = e.RequiresApproval,
                    IsPublic = e.IsPublic,
                    OrganizerName = e.OrganizerName,
                    OrganizerEmail = e.OrganizerEmail,
                    OrganizerPhone = e.OrganizerPhone,
                    CreatedBy = e.CreatedBy,
                    CreatedAt = e.CreatedAt,
                    HasAvailableSeats = e.CurrentAttendees < e.MaxAttendees
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/Events/5
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetEvent(int id)
        {
            var eventItem = await _context.Events
                .Include(e => e.Venue)
                .Include(e => e.Attendees)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventItem == null)
            {
                return NotFound(new { message = "Event not found." });
            }

            var currentUserId = User.Identity?.IsAuthenticated == true 
                ? (await _userManager.GetUserAsync(User))?.Id 
                : null;

            var eventDto = new EventDto
            {
                Id = eventItem.Id,
                Title = eventItem.Title,
                Date = eventItem.Date,
                EndDate = eventItem.EndDate,
                Location = eventItem.Location,
                Description = eventItem.Description,
                MaxAttendees = eventItem.MaxAttendees,
                CurrentAttendees = eventItem.CurrentAttendees,
                Category = eventItem.Category.ToString(),
                Status = eventItem.Status.ToString(),
                VenueId = eventItem.VenueId,
                VenueName = eventItem.Venue?.Name,
                ImageUrl = eventItem.ImageUrl,
                TicketPrice = eventItem.TicketPrice,
                IsFree = eventItem.IsFree,
                RequiresApproval = eventItem.RequiresApproval,
                IsPublic = eventItem.IsPublic,
                OrganizerName = eventItem.OrganizerName,
                OrganizerEmail = eventItem.OrganizerEmail,
                OrganizerPhone = eventItem.OrganizerPhone,
                CreatedBy = eventItem.CreatedBy,
                CreatedAt = eventItem.CreatedAt,
                IsUserRegistered = currentUserId != null && eventItem.Attendees.Any(a => a.UserId == currentUserId),
                HasAvailableSeats = eventItem.CurrentAttendees < eventItem.MaxAttendees
            };

            return Ok(eventDto);
        }

        // POST: api/Events
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<EventDto>> CreateEvent(CreateEventDto createDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            // Validate venue if provided
            if (createDto.VenueId.HasValue)
            {
                var venueExists = await _context.Venues.AnyAsync(v => v.Id == createDto.VenueId.Value && v.IsActive);
                if (!venueExists)
                {
                    return BadRequest(new { message = "Invalid or inactive venue." });
                }
            }

            var eventItem = new Event
            {
                Title = createDto.Title,
                Date = createDto.Date,
                EndDate = createDto.EndDate,
                Location = createDto.Location,
                Description = createDto.Description,
                MaxAttendees = createDto.MaxAttendees,
                CurrentAttendees = 0,
                Category = createDto.Category,
                Status = EventStatus.Draft,
                VenueId = createDto.VenueId,
                ImageUrl = createDto.ImageUrl,
                TicketPrice = createDto.TicketPrice,
                IsFree = createDto.IsFree,
                RequiresApproval = createDto.RequiresApproval,
                IsPublic = createDto.IsPublic,
                OrganizerName = createDto.OrganizerName,
                OrganizerEmail = createDto.OrganizerEmail,
                OrganizerPhone = createDto.OrganizerPhone,
                CreatedBy = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            _context.Events.Add(eventItem);
            await _context.SaveChangesAsync();

            var eventDto = new EventDto
            {
                Id = eventItem.Id,
                Title = eventItem.Title,
                Date = eventItem.Date,
                EndDate = eventItem.EndDate,
                Location = eventItem.Location,
                Description = eventItem.Description,
                MaxAttendees = eventItem.MaxAttendees,
                CurrentAttendees = eventItem.CurrentAttendees,
                Category = eventItem.Category.ToString(),
                Status = eventItem.Status.ToString(),
                VenueId = eventItem.VenueId,
                ImageUrl = eventItem.ImageUrl,
                TicketPrice = eventItem.TicketPrice,
                IsFree = eventItem.IsFree,
                RequiresApproval = eventItem.RequiresApproval,
                IsPublic = eventItem.IsPublic,
                OrganizerName = eventItem.OrganizerName,
                OrganizerEmail = eventItem.OrganizerEmail,
                OrganizerPhone = eventItem.OrganizerPhone,
                CreatedBy = eventItem.CreatedBy,
                CreatedAt = eventItem.CreatedAt,
                HasAvailableSeats = true
            };

            return CreatedAtAction(nameof(GetEvent), new { id = eventItem.Id }, eventDto);
        }

        // PUT: api/Events/5
        [AllowAnonymous]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, UpdateEventDto updateDto)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
            {
                return NotFound(new { message = "Event not found." });
            }

            // For development: Skip auth checks when not authenticated
            if (User.Identity?.IsAuthenticated == true)
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                // Check if user is the creator or admin
                if (eventItem.CreatedBy != user.Id && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }
            }

            // Validate venue if provided
            if (updateDto.VenueId.HasValue)
            {
                var venueExists = await _context.Venues.AnyAsync(v => v.Id == updateDto.VenueId.Value && v.IsActive);
                if (!venueExists)
                {
                    return BadRequest(new { message = "Invalid or inactive venue." });
                }
            }

            // Update fields if provided
            if (updateDto.Title != null) eventItem.Title = updateDto.Title;
            if (updateDto.Date.HasValue) eventItem.Date = updateDto.Date.Value;
            if (updateDto.EndDate.HasValue) eventItem.EndDate = updateDto.EndDate;
            if (updateDto.Location != null) eventItem.Location = updateDto.Location;
            if (updateDto.Description != null) eventItem.Description = updateDto.Description;
            if (updateDto.MaxAttendees.HasValue) eventItem.MaxAttendees = updateDto.MaxAttendees.Value;
            if (updateDto.Category.HasValue) eventItem.Category = updateDto.Category.Value;
            if (updateDto.Status.HasValue) eventItem.Status = updateDto.Status.Value;
            if (updateDto.VenueId.HasValue) eventItem.VenueId = updateDto.VenueId;
            if (updateDto.ImageUrl != null) eventItem.ImageUrl = updateDto.ImageUrl;
            if (updateDto.TicketPrice.HasValue) eventItem.TicketPrice = updateDto.TicketPrice;
            if (updateDto.IsFree.HasValue) eventItem.IsFree = updateDto.IsFree.Value;
            if (updateDto.RequiresApproval.HasValue) eventItem.RequiresApproval = updateDto.RequiresApproval.Value;
            if (updateDto.IsPublic.HasValue) eventItem.IsPublic = updateDto.IsPublic.Value;

            eventItem.UpdatedBy = user.Id;
            eventItem.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await EventExists(id))
                {
                    return NotFound(new { message = "Event not found." });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Events/5
        [AllowAnonymous]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var eventItem = await _context.Events
                .Include(e => e.Attendees)
                .Include(e => e.Bookings)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventItem == null)
            {
                return NotFound(new { message = "Event not found." });
            }

            // For development: Skip auth checks when not authenticated
            if (User.Identity?.IsAuthenticated == true)
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                // Check if user is the creator or admin
                if (eventItem.CreatedBy != user.Id && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }
            }

            // Check if there are active bookings/attendees
            if (eventItem.Attendees.Any() || eventItem.Bookings.Any())
            {
                // Soft delete by changing status
                eventItem.Status = EventStatus.Cancelled;
                eventItem.UpdatedBy = user.Id;
                eventItem.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Event cancelled (has active registrations/bookings)." });
            }

            _context.Events.Remove(eventItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> EventExists(int id)
        {
            return await _context.Events.AnyAsync(e => e.Id == id);
        }
    }
}