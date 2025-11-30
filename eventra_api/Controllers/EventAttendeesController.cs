using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventAttendeesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public EventAttendeesController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/EventAttendees/event/5
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<EventAttendeeDto>>> GetEventAttendees(int eventId)
        {
            var eventExists = await _context.Events.AnyAsync(e => e.Id == eventId);
            if (!eventExists)
            {
                return NotFound(new { message = "Event not found." });
            }

            var attendees = await _context.EventAttendees
                .Where(ea => ea.EventId == eventId)
                .Include(ea => ea.User)
                .Include(ea => ea.Event)
                .Select(ea => new EventAttendeeDto
                {
                    Id = ea.Id,
                    EventId = ea.EventId,
                    EventTitle = ea.Event.Title,
                    UserId = ea.UserId,
                    UserName = ea.User.UserName ?? "",
                    UserEmail = ea.User.Email ?? "",
                    RegistrationDate = ea.RegistrationDate,
                    Status = ea.Status.ToString(),
                    CheckInTime = ea.CheckInTime,
                    PaymentCompleted = ea.PaymentCompleted
                })
                .ToListAsync();

            return Ok(attendees);
        }

        // GET: api/EventAttendees/my-registrations
        [HttpGet("my-registrations")]
        public async Task<ActionResult<IEnumerable<EventAttendeeDto>>> GetMyRegistrations()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var registrations = await _context.EventAttendees
                .Where(ea => ea.UserId == user.Id)
                .Include(ea => ea.Event)
                .Select(ea => new EventAttendeeDto
                {
                    Id = ea.Id,
                    EventId = ea.EventId,
                    EventTitle = ea.Event.Title,
                    UserId = ea.UserId,
                    UserName = user.UserName ?? "",
                    UserEmail = user.Email ?? "",
                    RegistrationDate = ea.RegistrationDate,
                    Status = ea.Status.ToString(),
                    CheckInTime = ea.CheckInTime,
                    PaymentCompleted = ea.PaymentCompleted
                })
                .ToListAsync();

            return Ok(registrations);
        }

        // POST: api/EventAttendees/register
        [HttpPost("register")]
        public async Task<ActionResult<EventAttendeeDto>> RegisterForEvent(RegisterEventDto registerDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var eventItem = await _context.Events.FindAsync(registerDto.EventId);
            if (eventItem == null)
            {
                return NotFound(new { message = "Event not found." });
            }

            // Check if already registered
            var existingRegistration = await _context.EventAttendees
                .FirstOrDefaultAsync(ea => ea.EventId == registerDto.EventId && ea.UserId == user.Id);

            if (existingRegistration != null)
            {
                return BadRequest(new { message = "You are already registered for this event." });
            }

            // Check capacity
            if (eventItem.CurrentAttendees >= eventItem.MaxAttendees)
            {
                return BadRequest(new { message = "Event is full. No more seats available." });
            }

            var attendee = new EventAttendee
            {
                EventId = registerDto.EventId,
                UserId = user.Id,
                RegistrationDate = DateTime.UtcNow,
                Status = AttendeeStatus.Registered,
                Notes = registerDto.Notes,
                PaymentRequired = registerDto.PaymentRequired || !eventItem.IsFree,
                PaymentCompleted = eventItem.IsFree
            };

            _context.EventAttendees.Add(attendee);

            // Update event attendee count
            eventItem.CurrentAttendees++;
            
            await _context.SaveChangesAsync();

            var attendeeDto = new EventAttendeeDto
            {
                Id = attendee.Id,
                EventId = attendee.EventId,
                EventTitle = eventItem.Title,
                UserId = attendee.UserId,
                UserName = user.UserName ?? "",
                UserEmail = user.Email ?? "",
                RegistrationDate = attendee.RegistrationDate,
                Status = attendee.Status.ToString(),
                CheckInTime = attendee.CheckInTime,
                PaymentCompleted = attendee.PaymentCompleted
            };

            return CreatedAtAction(nameof(GetEventAttendees), new { eventId = registerDto.EventId }, attendeeDto);
        }

        // POST: api/EventAttendees/5/checkin
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/checkin")]
        public async Task<IActionResult> CheckInAttendee(int id)
        {
            var attendee = await _context.EventAttendees.FindAsync(id);
            if (attendee == null)
            {
                return NotFound(new { message = "Attendee registration not found." });
            }

            if (attendee.Status == AttendeeStatus.Cancelled)
            {
                return BadRequest(new { message = "Cannot check in a cancelled registration." });
            }

            if (attendee.Status == AttendeeStatus.CheckedIn)
            {
                return BadRequest(new { message = "Attendee already checked in." });
            }

            attendee.Status = AttendeeStatus.CheckedIn;
            attendee.CheckInTime = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Attendee checked in successfully.", checkInTime = attendee.CheckInTime });
        }

        // DELETE: api/EventAttendees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelRegistration(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var attendee = await _context.EventAttendees
                .Include(ea => ea.Event)
                .FirstOrDefaultAsync(ea => ea.Id == id);

            if (attendee == null)
            {
                return NotFound(new { message = "Registration not found." });
            }

            // Check if user owns this registration or is admin
            if (attendee.UserId != user.Id && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            if (attendee.Status == AttendeeStatus.CheckedIn)
            {
                return BadRequest(new { message = "Cannot cancel after check-in." });
            }

            attendee.Status = AttendeeStatus.Cancelled;

            // Update event attendee count
            if (attendee.Event.CurrentAttendees > 0)
            {
                attendee.Event.CurrentAttendees--;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration cancelled successfully." });
        }
    }
}
