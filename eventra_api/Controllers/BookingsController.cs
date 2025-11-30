using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;
using System.Security.Cryptography;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public BookingsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Bookings/my-bookings
        [HttpGet("my-bookings")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetMyBookings()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var bookings = await _context.Bookings
                .Where(b => b.UserId == user.Id)
                .Include(b => b.Event)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    EventId = b.EventId,
                    EventTitle = b.Event.Title,
                    EventDate = b.Event.Date,
                    UserId = b.UserId,
                    UserName = user.UserName ?? "",
                    BookingReference = b.BookingReference,
                    BookingDate = b.BookingDate,
                    Status = b.Status.ToString(),
                    NumberOfTickets = b.NumberOfTickets,
                    TotalAmount = b.TotalAmount,
                    AmountPaid = b.AmountPaid,
                    IsCheckedIn = b.IsCheckedIn,
                    QRCode = b.QRCode
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/event/5
        [Authorize]
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetEventBookings(int eventId)
        {
            var eventExists = await _context.Events.AnyAsync(e => e.Id == eventId);
            if (!eventExists)
            {
                return NotFound(new { message = "Event not found." });
            }

            var bookings = await _context.Bookings
                .Where(b => b.EventId == eventId)
                .Include(b => b.Event)
                .Include(b => b.User)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    EventId = b.EventId,
                    EventTitle = b.Event.Title,
                    EventDate = b.Event.Date,
                    UserId = b.UserId,
                    UserName = b.User.UserName ?? "",
                    BookingReference = b.BookingReference,
                    BookingDate = b.BookingDate,
                    Status = b.Status.ToString(),
                    NumberOfTickets = b.NumberOfTickets,
                    TotalAmount = b.TotalAmount,
                    AmountPaid = b.AmountPaid,
                    IsCheckedIn = b.IsCheckedIn,
                    QRCode = b.QRCode
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var booking = await _context.Bookings
                .Include(b => b.Event)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            // Check if user owns this booking or is admin
            if (booking.UserId != user.Id)
            {
                return Forbid();
            }

            var bookingDto = new BookingDto
            {
                Id = booking.Id,
                EventId = booking.EventId,
                EventTitle = booking.Event.Title,
                EventDate = booking.Event.Date,
                UserId = booking.UserId,
                UserName = booking.User.UserName ?? "",
                BookingReference = booking.BookingReference,
                BookingDate = booking.BookingDate,
                Status = booking.Status.ToString(),
                NumberOfTickets = booking.NumberOfTickets,
                TotalAmount = booking.TotalAmount,
                AmountPaid = booking.AmountPaid,
                IsCheckedIn = booking.IsCheckedIn,
                QRCode = booking.QRCode
            };

            return Ok(bookingDto);
        }

        // POST: api/Bookings
        [HttpPost]
        public async Task<ActionResult<BookingDto>> CreateBooking(CreateBookingDto createDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var eventItem = await _context.Events.FindAsync(createDto.EventId);
            if (eventItem == null)
            {
                return NotFound(new { message = "Event not found." });
            }

            // Check capacity
            if (eventItem.CurrentAttendees + createDto.NumberOfTickets > eventItem.MaxAttendees)
            {
                return BadRequest(new { message = "Not enough seats available." });
            }

            // Check if already booked
            var existingBooking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.EventId == createDto.EventId && b.UserId == user.Id && b.Status != BookingStatus.Cancelled);

            if (existingBooking != null)
            {
                return BadRequest(new { message = "You already have an active booking for this event." });
            }

            var totalAmount = (eventItem.TicketPrice ?? 0) * createDto.NumberOfTickets;
            var bookingReference = GenerateBookingReference();

            var booking = new Booking
            {
                EventId = createDto.EventId,
                UserId = user.Id,
                BookingReference = bookingReference,
                BookingDate = DateTime.UtcNow,
                Status = eventItem.IsFree ? BookingStatus.Confirmed : BookingStatus.Pending,
                NumberOfTickets = createDto.NumberOfTickets,
                TotalAmount = totalAmount,
                AmountPaid = eventItem.IsFree ? totalAmount : 0,
                PaymentDate = eventItem.IsFree ? DateTime.UtcNow : null,
                SpecialRequests = createDto.SpecialRequests,
                QRCode = GenerateQRCode(bookingReference),
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);

            // Update event attendee count
            eventItem.CurrentAttendees += createDto.NumberOfTickets;

            await _context.SaveChangesAsync();

            var bookingDto = new BookingDto
            {
                Id = booking.Id,
                EventId = booking.EventId,
                EventTitle = eventItem.Title,
                EventDate = eventItem.Date,
                UserId = booking.UserId,
                UserName = user.UserName ?? "",
                BookingReference = booking.BookingReference,
                BookingDate = booking.BookingDate,
                Status = booking.Status.ToString(),
                NumberOfTickets = booking.NumberOfTickets,
                TotalAmount = booking.TotalAmount,
                AmountPaid = booking.AmountPaid,
                IsCheckedIn = booking.IsCheckedIn,
                QRCode = booking.QRCode
            };

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, bookingDto);
        }

        // POST: api/Bookings/5/payment
        [HttpPost("{id}/payment")]
        public async Task<IActionResult> ProcessPayment(int id, ProcessPaymentDto paymentDto)
        {
            if (id != paymentDto.BookingId)
            {
                return BadRequest(new { message = "Booking ID mismatch." });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var booking = await _context.Bookings
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            // Check if user owns this booking
            if (booking.UserId != user.Id)
            {
                return Forbid();
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                return BadRequest(new { message = "Cannot process payment for cancelled booking." });
            }

            if (booking.AmountPaid + paymentDto.Amount > booking.TotalAmount)
            {
                return BadRequest(new { message = "Payment amount exceeds balance due." });
            }

            booking.AmountPaid += paymentDto.Amount;
            booking.PaymentMethod = paymentDto.PaymentMethod;
            booking.TransactionId = paymentDto.TransactionId;
            booking.PaymentDate = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;

            if (booking.AmountPaid >= booking.TotalAmount)
            {
                booking.Status = BookingStatus.Confirmed;
            }

            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                message = "Payment processed successfully.", 
                amountPaid = booking.AmountPaid,
                remainingBalance = booking.TotalAmount - booking.AmountPaid,
                status = booking.Status.ToString()
            });
        }

        // POST: api/Bookings/5/checkin
        [Authorize]
        [HttpPost("{id}/checkin")]
        public async Task<IActionResult> CheckInBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            if (booking.Status != BookingStatus.Confirmed)
            {
                return BadRequest(new { message = "Only confirmed bookings can be checked in." });
            }

            if (booking.IsCheckedIn)
            {
                return BadRequest(new { message = "Booking already checked in." });
            }

            booking.IsCheckedIn = true;
            booking.CheckInTime = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Check-in successful.", checkInTime = booking.CheckInTime });
        }

        // DELETE: api/Bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var booking = await _context.Bookings
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            // Check if user owns this booking or is admin
            if (booking.UserId != user.Id)
            {
                return Forbid();
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                return BadRequest(new { message = "Booking already cancelled." });
            }

            if (booking.IsCheckedIn)
            {
                return BadRequest(new { message = "Cannot cancel after check-in." });
            }

            booking.Status = BookingStatus.Cancelled;
            booking.CancellationDate = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;

            // Update event attendee count
            if (booking.Event.CurrentAttendees >= booking.NumberOfTickets)
            {
                booking.Event.CurrentAttendees -= booking.NumberOfTickets;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking cancelled successfully." });
        }

        private string GenerateBookingReference()
        {
            return $"BK{DateTime.UtcNow:yyyyMMdd}{RandomNumberGenerator.GetInt32(10000, 99999)}";
        }

        private string GenerateQRCode(string bookingReference)
        {
            // In production, integrate with actual QR code generation library
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(bookingReference));
        }
    }
}
