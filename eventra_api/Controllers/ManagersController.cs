using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;
using eventra_api.Services;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Owner")]
    public class ManagersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly TokenService _tokenService;

        public ManagersController(AppDbContext context, UserManager<ApplicationUser> userManager, TokenService tokenService)
        {
            _context = context;
            _userManager = userManager;
            _tokenService = tokenService;
        }

        // GET: api/Managers
        [HttpGet]
        public async Task<IActionResult> GetManagers()
        {
            var managers = await _userManager.GetUsersInRoleAsync("Manager");

            var result = managers.Select(m => new
            {
                id = m.Id,
                email = m.Email,
                firstName = m.FirstName,
                lastName = m.SecondName,
                venueId = m.VenueId,
                venueName = m.VenueId.HasValue
                    ? _context.Venues.Find(m.VenueId.Value)?.Name
                    : null,
                isActive = m.IsActive,
                isApproved = m.IsApproved,
                dateRegistered = m.DateRegistered
            }).ToList();

            return Ok(result);
        }

        // POST: api/Managers — Owner creates a Manager account for a specific Marque
        [HttpPost]
        public async Task<IActionResult> CreateManager([FromBody] CreateManagerDto dto)
        {
            var venue = await _context.Venues.FindAsync(dto.VenueId);
            if (venue == null)
                return NotFound(new { message = "Marque not found." });

            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                return BadRequest(new { message = "User with this email already exists." });

            var manager = new ApplicationUser
            {
                Email = dto.Email,
                UserName = dto.Email,
                FirstName = dto.FirstName,
                SecondName = dto.LastName,
                VenueId = dto.VenueId,
                IsApproved = true, // Owner-created accounts are auto-approved
                IsActive = true,
                DateRegistered = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(manager, dto.Password);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to create manager.", errors = result.Errors });

            await _userManager.AddToRoleAsync(manager, "Manager");

            return Ok(new
            {
                message = "Manager created successfully.",
                id = manager.Id,
                email = manager.Email,
                venueId = manager.VenueId,
                venueName = venue.Name
            });
        }

        // PUT: api/Managers/5/venue — reassign Manager to a different Marque
        [HttpPut("{id}/venue")]
        public async Task<IActionResult> ReassignVenue(string id, [FromBody] ReassignVenueDto dto)
        {
            var manager = await _userManager.FindByIdAsync(id);
            if (manager == null)
                return NotFound(new { message = "Manager not found." });

            if (!await _userManager.IsInRoleAsync(manager, "Manager"))
                return BadRequest(new { message = "User is not a Manager." });

            var venue = await _context.Venues.FindAsync(dto.VenueId);
            if (venue == null)
                return NotFound(new { message = "Marque not found." });

            manager.VenueId = dto.VenueId;
            await _userManager.UpdateAsync(manager);

            return Ok(new { message = $"Manager reassigned to {venue.Name}.", venueId = dto.VenueId });
        }

        // DELETE: api/Managers/5 — deactivate a Manager
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeactivateManager(string id)
        {
            var manager = await _userManager.FindByIdAsync(id);
            if (manager == null)
                return NotFound(new { message = "Manager not found." });

            if (!await _userManager.IsInRoleAsync(manager, "Manager"))
                return BadRequest(new { message = "User is not a Manager." });

            manager.IsActive = false;
            manager.IsApproved = false;
            await _userManager.UpdateAsync(manager);

            return Ok(new { message = "Manager deactivated." });
        }
    }

    public class CreateManagerDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public int VenueId { get; set; }
    }

    public class ReassignVenueDto
    {
        [Required]
        public int VenueId { get; set; }
    }
}
