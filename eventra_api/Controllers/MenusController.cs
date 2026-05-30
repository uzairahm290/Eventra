using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;
using System.Security.Claims;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MenusController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MenusController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetScopedVenueId()
        {
            var claim = User.FindFirstValue("VenueId");
            return int.TryParse(claim, out var v) ? v : null;
        }

        // GET: api/Menus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuDto>>> GetAllMenus()
        {
            var scopedVenueId = GetScopedVenueId();

            var query = _context.Menus
                .Include(m => m.Venue)
                .AsQueryable();

            if (scopedVenueId.HasValue)
                query = query.Where(m => m.VenueId == scopedVenueId.Value);

            var menus = await query
                .OrderBy(m => m.Name)
                .Select(m => new MenuDto
                {
                    Id = m.Id,
                    VenueId = m.VenueId,
                    VenueName = m.Venue.Name,
                    Name = m.Name,
                    Category = m.Category,
                    Description = m.Description,
                    PricePerPerson = m.PricePerPerson,
                    MinimumGuests = m.MinimumGuests,
                    IsVegetarian = m.IsVegetarian,
                    IsVegan = m.IsVegan,
                    IsGlutenFree = m.IsGlutenFree,
                    AllergenInfo = m.AllergenInfo,
                    IsAvailable = m.IsAvailable
                })
                .ToListAsync();

            return Ok(menus);
        }

        // GET: api/Menus/venue/5
        [HttpGet("venue/{venueId}")]
        public async Task<ActionResult<IEnumerable<MenuDto>>> GetVenueMenus(int venueId)
        {
            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && scopedVenueId.Value != venueId)
                return Forbid();

            var menus = await _context.Menus
                .Include(m => m.Venue)
                .Where(m => m.VenueId == venueId)
                .OrderBy(m => m.Name)
                .Select(m => new MenuDto
                {
                    Id = m.Id,
                    VenueId = m.VenueId,
                    VenueName = m.Venue.Name,
                    Name = m.Name,
                    Category = m.Category,
                    Description = m.Description,
                    PricePerPerson = m.PricePerPerson,
                    MinimumGuests = m.MinimumGuests,
                    IsVegetarian = m.IsVegetarian,
                    IsVegan = m.IsVegan,
                    IsGlutenFree = m.IsGlutenFree,
                    AllergenInfo = m.AllergenInfo,
                    IsAvailable = m.IsAvailable
                })
                .ToListAsync();

            return Ok(menus);
        }

        // GET: api/Menus/event/5 — menus assigned to a specific event via EventMenu junction
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<MenuDto>>> GetEventMenus(int eventId)
        {
            var eventExists = await _context.Events.AnyAsync(e => e.Id == eventId);
            if (!eventExists)
                return Ok(new List<MenuDto>());

            var menus = await _context.EventMenus
                .Where(em => em.EventId == eventId)
                .Include(em => em.Menu).ThenInclude(m => m.Venue)
                .Select(em => new MenuDto
                {
                    Id = em.Menu.Id,
                    VenueId = em.Menu.VenueId,
                    VenueName = em.Menu.Venue.Name,
                    Name = em.Menu.Name,
                    Category = em.Menu.Category,
                    Description = em.Menu.Description,
                    PricePerPerson = em.Menu.PricePerPerson,
                    MinimumGuests = em.Menu.MinimumGuests,
                    IsVegetarian = em.Menu.IsVegetarian,
                    IsVegan = em.Menu.IsVegan,
                    IsGlutenFree = em.Menu.IsGlutenFree,
                    AllergenInfo = em.Menu.AllergenInfo,
                    IsAvailable = em.Menu.IsAvailable
                })
                .ToListAsync();

            return Ok(menus);
        }

        // GET: api/Menus/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MenuDto>> GetMenu(int id)
        {
            var menu = await _context.Menus.Include(m => m.Venue).FirstOrDefaultAsync(m => m.Id == id);
            if (menu == null)
                return NotFound(new { message = "Menu not found." });

            return Ok(new MenuDto
            {
                Id = menu.Id,
                VenueId = menu.VenueId,
                VenueName = menu.Venue.Name,
                Name = menu.Name,
                Category = menu.Category,
                Description = menu.Description,
                PricePerPerson = menu.PricePerPerson,
                MinimumGuests = menu.MinimumGuests,
                IsVegetarian = menu.IsVegetarian,
                IsVegan = menu.IsVegan,
                IsGlutenFree = menu.IsGlutenFree,
                AllergenInfo = menu.AllergenInfo,
                IsAvailable = menu.IsAvailable
            });
        }

        // POST: api/Menus
        [HttpPost]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<ActionResult<MenuDto>> CreateMenu(CreateMenuDto createDto)
        {
            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && scopedVenueId.Value != createDto.VenueId)
                return Forbid();

            var venue = await _context.Venues.FindAsync(createDto.VenueId);
            if (venue == null)
                return NotFound(new { message = "Venue (Marque) not found." });

            var menu = new Menu
            {
                VenueId = createDto.VenueId,
                Name = createDto.Name,
                Category = createDto.Category,
                Description = createDto.Description,
                PricePerPerson = createDto.PricePerPerson,
                MinimumGuests = createDto.MinimumGuests,
                IsVegetarian = createDto.IsVegetarian,
                IsVegan = createDto.IsVegan,
                IsGlutenFree = createDto.IsGlutenFree,
                AllergenInfo = createDto.AllergenInfo,
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Menus.Add(menu);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMenu), new { id = menu.Id }, new MenuDto
            {
                Id = menu.Id,
                VenueId = menu.VenueId,
                VenueName = venue.Name,
                Name = menu.Name,
                Category = menu.Category,
                Description = menu.Description,
                PricePerPerson = menu.PricePerPerson,
                MinimumGuests = menu.MinimumGuests,
                IsVegetarian = menu.IsVegetarian,
                IsVegan = menu.IsVegan,
                IsGlutenFree = menu.IsGlutenFree,
                AllergenInfo = menu.AllergenInfo,
                IsAvailable = menu.IsAvailable
            });
        }

        // PUT: api/Menus/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> UpdateMenu(int id, CreateMenuDto updateDto)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null)
                return NotFound(new { message = "Menu not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && menu.VenueId != scopedVenueId.Value)
                return Forbid();

            menu.Name = updateDto.Name;
            menu.Category = updateDto.Category;
            menu.Description = updateDto.Description;
            menu.PricePerPerson = updateDto.PricePerPerson;
            menu.MinimumGuests = updateDto.MinimumGuests;
            menu.IsVegetarian = updateDto.IsVegetarian;
            menu.IsVegan = updateDto.IsVegan;
            menu.IsGlutenFree = updateDto.IsGlutenFree;
            menu.AllergenInfo = updateDto.AllergenInfo;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Menus/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> DeleteMenu(int id)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null)
                return NotFound(new { message = "Menu not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && menu.VenueId != scopedVenueId.Value)
                return Forbid();

            _context.Menus.Remove(menu);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/Menus/5/availability
        [HttpPatch("{id}/availability")]
        [Authorize(Roles = "Owner,Manager")]
        public async Task<IActionResult> ToggleAvailability(int id, [FromBody] bool isAvailable)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null)
                return NotFound(new { message = "Menu not found." });

            var scopedVenueId = GetScopedVenueId();
            if (scopedVenueId.HasValue && menu.VenueId != scopedVenueId.Value)
                return Forbid();

            menu.IsAvailable = isAvailable;
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Menu {(isAvailable ? "enabled" : "disabled")} successfully." });
        }
    }
}
