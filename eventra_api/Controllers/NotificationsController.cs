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
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Notifications/my-notifications
        [HttpGet("my-notifications")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetMyNotifications([FromQuery] bool includeRead = false)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var query = _context.Notifications
                .Where(n => n.UserId == user.Id);

            if (!includeRead)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .Include(n => n.Event)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Type = n.Type.ToString(),
                    Title = n.Title,
                    Message = n.Message,
                    EventId = n.EventId,
                    EventTitle = n.Event != null ? n.Event.Title : null,
                    BookingId = n.BookingId,
                    IsRead = n.IsRead,
                    ReadAt = n.ReadAt,
                    CreatedAt = n.CreatedAt,
                    ActionUrl = n.ActionUrl
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // GET: api/Notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var count = await _context.Notifications
                .CountAsync(n => n.UserId == user.Id && !n.IsRead);

            return Ok(new { unreadCount = count });
        }

        // GET: api/Notifications/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationDto>> GetNotification(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var notification = await _context.Notifications
                .Include(n => n.Event)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
            {
                return NotFound(new { message = "Notification not found." });
            }

            // Check if user owns this notification
            if (notification.UserId != user.Id)
            {
                return Forbid();
            }

            var notificationDto = new NotificationDto
            {
                Id = notification.Id,
                Type = notification.Type.ToString(),
                Title = notification.Title,
                Message = notification.Message,
                EventId = notification.EventId,
                EventTitle = notification.Event?.Title,
                BookingId = notification.BookingId,
                IsRead = notification.IsRead,
                ReadAt = notification.ReadAt,
                CreatedAt = notification.CreatedAt,
                ActionUrl = notification.ActionUrl
            };

            return Ok(notificationDto);
        }

        // POST: api/Notifications (Admin only - for manual notifications)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] Notification notification)
        {
            notification.CreatedAt = DateTime.UtcNow;
            notification.IsRead = false;

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            var notificationDto = new NotificationDto
            {
                Id = notification.Id,
                Type = notification.Type.ToString(),
                Title = notification.Title,
                Message = notification.Message,
                EventId = notification.EventId,
                BookingId = notification.BookingId,
                IsRead = notification.IsRead,
                ReadAt = notification.ReadAt,
                CreatedAt = notification.CreatedAt,
                ActionUrl = notification.ActionUrl
            };

            return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notificationDto);
        }

        // PUT: api/Notifications/5/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
            {
                return NotFound(new { message = "Notification not found." });
            }

            // Check if user owns this notification
            if (notification.UserId != user.Id)
            {
                return Forbid();
            }

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Notification marked as read." });
        }

        // PUT: api/Notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == user.Id && !n.IsRead)
                .ToListAsync();

            var now = DateTime.UtcNow;
            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                notification.ReadAt = now;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"{unreadNotifications.Count} notifications marked as read." });
        }

        // DELETE: api/Notifications/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
            {
                return NotFound(new { message = "Notification not found." });
            }

            // Check if user owns this notification
            if (notification.UserId != user.Id)
            {
                return Forbid();
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Notifications/clear-all
        [HttpDelete("clear-all")]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == user.Id)
                .ToListAsync();

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{notifications.Count} notifications deleted." });
        }
    }
}
