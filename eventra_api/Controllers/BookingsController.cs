using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;
using eventra_api.Services;
using System.Security.Claims;
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

        private int? GetScopedVenueId()
        {
            var venueIdClaim = User.FindFirstValue("VenueId");
            return int.TryParse(venueIdClaim, out var v) ? v : null;
        }

        private bool IsOwner() => User.IsInRole("Owner");

        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetAllBookings()
        {
            var scopedVenueId = GetScopedVenueId();

            var query = _context.Bookings
                .Include(b => b.Event).ThenInclude(e => e.Venue)
                .Include(b => b.Client)
                .Include(b => b.Hall)
                .AsQueryable();

            if (scopedVenueId.HasValue)
                query = query.Where(b => b.Hall != null
                    ? b.Hall.VenueId == scopedVenueId.Value
                    : b.Event.VenueId == scopedVenueId.Value);

            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    EventId = b.EventId,
                    EventTitle = b.Event.Title,
                    EventDate = b.Event.Date,
                    MarqueName = b.Event.Venue != null ? b.Event.Venue.Name : null,
                    ClientId = b.ClientId,
                    ClientName = b.Client.FirstName + " " + b.Client.SecondName,
                    ClientPhone = b.Client.Phone,
                    ClientCNIC = b.Client.CNIC,
                    HallId = b.HallId,
                    HallName = b.Hall != null ? b.Hall.Name : null,
                    BookingReference = b.BookingReference,
                    BookingDate = b.BookingDate,
                    Status = b.Status.ToString(),
                    NumberOfGuests = b.NumberOfGuests,
                    TotalAmount = b.TotalAmount,
                    DepositAmount = b.DepositAmount,
                    AmountPaid = b.AmountPaid,
                    PaymentMethod = b.PaymentMethod,
                    IsCheckedIn = b.IsCheckedIn,
                    IsApprovedByAdmin = b.IsApprovedByAdmin,
                    SpecialRequests = b.SpecialRequests,
                    CancellationReason = b.CancellationReason,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/event/5
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetEventBookings(int eventId)
        {
            var eventExists = await _context.Events.AnyAsync(e => e.Id == eventId);
            if (!eventExists)
                return NotFound(new { message = "Event not found." });

            var scopedVenueId = GetScopedVenueId();

            var query = _context.Bookings
                .Where(b => b.EventId == eventId)
                .Include(b => b.Event).ThenInclude(e => e.Venue)
                .Include(b => b.Client)
                .Include(b => b.Hall)
                .AsQueryable();

            if (scopedVenueId.HasValue)
                query = query.Where(b => b.Hall != null
                    ? b.Hall.VenueId == scopedVenueId.Value
                    : b.Event.VenueId == scopedVenueId.Value);

            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    EventId = b.EventId,
                    EventTitle = b.Event.Title,
                    EventDate = b.Event.Date,
                    MarqueName = b.Event.Venue != null ? b.Event.Venue.Name : null,
                    ClientId = b.ClientId,
                    ClientName = b.Client.FirstName + " " + b.Client.SecondName,
                    ClientPhone = b.Client.Phone,
                    ClientCNIC = b.Client.CNIC,
                    HallId = b.HallId,
                    HallName = b.Hall != null ? b.Hall.Name : null,
                    BookingReference = b.BookingReference,
                    BookingDate = b.BookingDate,
                    Status = b.Status.ToString(),
                    NumberOfGuests = b.NumberOfGuests,
                    TotalAmount = b.TotalAmount,
                    DepositAmount = b.DepositAmount,
                    AmountPaid = b.AmountPaid,
                    IsCheckedIn = b.IsCheckedIn,
                    IsApprovedByAdmin = b.IsApprovedByAdmin,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Event).ThenInclude(e => e.Venue)
                .Include(b => b.Client)
                .Include(b => b.Hall)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue)
            {
                var bookingVenueId = booking.Hall?.VenueId ?? booking.Event.VenueId;
                if (bookingVenueId != scopedVenueId.Value)
                    return Forbid();
            }

            return Ok(MapToDto(booking));
        }

        // POST: api/Bookings
        [HttpPost]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<ActionResult<BookingDto>> CreateBooking(CreateBookingDto createDto)
        {
            var client = await _context.Clients.FindAsync(createDto.ClientId);
            if (client == null)
                return NotFound(new { message = "Client not found." });

            var eventItem = await _context.Events.Include(e => e.Venue).FirstOrDefaultAsync(e => e.Id == createDto.EventId);
            if (eventItem == null)
                return NotFound(new { message = "Event not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue)
            {
                var venueId = createDto.HallId.HasValue
                    ? (await _context.Halls.FindAsync(createDto.HallId.Value))?.VenueId
                    : eventItem.VenueId;

                if (venueId != scopedVenueId.Value)
                    return Forbid();
            }

            if (createDto.HallId.HasValue)
            {
                var hall = await _context.Halls.FindAsync(createDto.HallId.Value);
                if (hall == null)
                    return NotFound(new { message = "Hall not found." });
            }

            // Check capacity
            if (eventItem.CurrentAttendees + createDto.NumberOfGuests > eventItem.MaxAttendees)
                return BadRequest(new { message = "Not enough capacity available." });

            var bookingReference = GenerateBookingReference();
            var currentUser = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var booking = new Booking
            {
                EventId = createDto.EventId,
                ClientId = createDto.ClientId,
                HallId = createDto.HallId,
                BookingReference = bookingReference,
                BookingDate = DateTime.UtcNow,
                Status = BookingStatus.Pending,
                NumberOfGuests = createDto.NumberOfGuests,
                TotalAmount = createDto.TotalAmount,
                DepositAmount = createDto.DepositAmount,
                AmountPaid = 0,
                PaymentMethod = createDto.PaymentMethod,
                SpecialRequests = createDto.SpecialRequests,
                CreatedByUserId = currentUser,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            eventItem.CurrentAttendees += createDto.NumberOfGuests;
            await _context.SaveChangesAsync();

            var created = await _context.Bookings
                .Include(b => b.Event).ThenInclude(e => e.Venue)
                .Include(b => b.Client)
                .Include(b => b.Hall)
                .FirstOrDefaultAsync(b => b.Id == booking.Id);

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, MapToDto(created!));
        }

        // POST: api/Bookings/5/payment
        [HttpPost("{id}/payment")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> ProcessPayment(int id, ProcessPaymentDto paymentDto)
        {
            if (id != paymentDto.BookingId)
                return BadRequest(new { message = "Booking ID mismatch." });

            var booking = await _context.Bookings.Include(b => b.Event).FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            if (booking.Status == BookingStatus.Cancelled)
                return BadRequest(new { message = "Cannot process payment for cancelled booking." });

            if (booking.AmountPaid + paymentDto.Amount > booking.TotalAmount)
                return BadRequest(new { message = "Payment amount exceeds balance due." });

            booking.AmountPaid += paymentDto.Amount;
            booking.PaymentMethod = paymentDto.PaymentMethod;
            booking.TransactionId = paymentDto.TransactionId;
            booking.PaymentDate = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;

            if (booking.AmountPaid >= booking.TotalAmount)
                booking.Status = BookingStatus.Confirmed;

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
        [HttpPost("{id}/checkin")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> CheckInBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            if (booking.Status != BookingStatus.Confirmed)
                return BadRequest(new { message = "Only confirmed bookings can be checked in." });

            if (booking.IsCheckedIn)
                return BadRequest(new { message = "Booking already checked in." });

            booking.IsCheckedIn = true;
            booking.CheckInTime = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Check-in successful.", checkInTime = booking.CheckInTime });
        }

        // DELETE: api/Bookings/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingDto? cancelDto = null)
        {
            var booking = await _context.Bookings
                .Include(b => b.Event)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            if (booking.Status == BookingStatus.Cancelled)
                return BadRequest(new { message = "Booking already cancelled." });

            booking.Status = BookingStatus.Cancelled;
            booking.CancellationDate = DateTime.UtcNow;
            booking.CancellationReason = cancelDto?.Reason;
            booking.UpdatedAt = DateTime.UtcNow;

            if (booking.Event.CurrentAttendees >= booking.NumberOfGuests)
                booking.Event.CurrentAttendees -= booking.NumberOfGuests;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Booking cancelled successfully." });
        }

        // POST: api/Bookings/5/approve
        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> ApproveBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            booking.IsApprovedByAdmin = true;
            booking.Status = BookingStatus.Confirmed;
            booking.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking approved." });
        }

        // POST: api/Bookings/5/reject
        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> RejectBooking(int id, [FromBody] CancelBookingDto? rejectDto = null)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            booking.IsApprovedByAdmin = false;
            booking.Status = BookingStatus.Cancelled;
            booking.CancellationReason = rejectDto?.Reason ?? "Rejected by Owner/Manager";
            booking.CancellationDate = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking rejected." });
        }

        private static BookingDto MapToDto(Booking b) => new BookingDto
        {
            Id = b.Id,
            EventId = b.EventId,
            EventTitle = b.Event.Title,
            EventDate = b.Event.Date,
            MarqueName = b.Event.Venue?.Name,
            ClientId = b.ClientId,
            ClientName = b.Client.FirstName + " " + b.Client.SecondName,
            ClientPhone = b.Client.Phone,
            ClientCNIC = b.Client.CNIC,
            HallId = b.HallId,
            HallName = b.Hall?.Name,
            BookingReference = b.BookingReference,
            BookingDate = b.BookingDate,
            Status = b.Status.ToString(),
            NumberOfGuests = b.NumberOfGuests,
            TotalAmount = b.TotalAmount,
            DepositAmount = b.DepositAmount,
            AmountPaid = b.AmountPaid,
            PaymentMethod = b.PaymentMethod,
            IsCheckedIn = b.IsCheckedIn,
            IsApprovedByAdmin = b.IsApprovedByAdmin,
            SpecialRequests = b.SpecialRequests,
            CancellationReason = b.CancellationReason,
            CreatedAt = b.CreatedAt
        };

        private static string GenerateBookingReference()
            => $"BK{DateTime.UtcNow:yyyyMMdd}{RandomNumberGenerator.GetInt32(10000, 99999)}";
    }

    public class CancelBookingDto
    {
        public string? Reason { get; set; }
    }
}
