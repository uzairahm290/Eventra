using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;

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

        // GET: api/Menus - Get all menus in catalog
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuDto>>> GetAllMenus()
        {
            var menus = await _context.Menus
                .Where(m => m.IsAvailable)
                .Select(m => new MenuDto
                {
                    Id = m.Id,
                    EventId = m.EventId,
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

        // GET: api/Menus/event/5
        [AllowAnonymous]
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<MenuDto>>> GetEventMenus(int eventId)
        {
            // Return empty array if event doesn't exist instead of 404
            var eventExists = await _context.Events.AnyAsync(e => e.Id == eventId);
            if (!eventExists)
            {
                return Ok(new List<MenuDto>());
            }

            // Return only menus assigned to this specific event
            var menus = await _context.Menus
                .Where(m => m.EventId == eventId && m.IsAvailable)
                .Select(m => new MenuDto
                {
                    Id = m.Id,
                    EventId = m.EventId,
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

        // GET: api/Menus/5
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<MenuDto>> GetMenu(int id)
        {
            var menu = await _context.Menus.FindAsync(id);

            if (menu == null)
            {
                return NotFound(new { message = "Menu not found." });
            }

            var menuDto = new MenuDto
            {
                Id = menu.Id,
                EventId = menu.EventId,
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
            };

            return Ok(menuDto);
        }

        // POST: api/Menus
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<MenuDto>> CreateMenu(CreateMenuDto createDto)
        {
            // Validate event exists if EventId is provided
            if (createDto.EventId.HasValue)
            {
                var eventExists = await _context.Events.AnyAsync(e => e.Id == createDto.EventId.Value);
                if (!eventExists)
                {
                    return NotFound(new { message = "Event not found." });
                }
            }

            var menu = new Menu
            {
                EventId = createDto.EventId,
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

            var menuDto = new MenuDto
            {
                Id = menu.Id,
                EventId = menu.EventId,
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
            };

            return CreatedAtAction(nameof(GetMenu), new { id = menu.Id }, menuDto);
        }

        // PUT: api/Menus/5
        [AllowAnonymous]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMenu(int id, CreateMenuDto updateDto)
        {
            var menu = await _context.Menus.FindAsync(id);

            if (menu == null)
            {
                return NotFound(new { message = "Menu not found." });
            }

            menu.Name = updateDto.Name;
            menu.Category = updateDto.Category;
            menu.Description = updateDto.Description;
            menu.PricePerPerson = updateDto.PricePerPerson;
            menu.MinimumGuests = updateDto.MinimumGuests;
            menu.IsVegetarian = updateDto.IsVegetarian;
            menu.IsVegan = updateDto.IsVegan;
            menu.IsGlutenFree = updateDto.IsGlutenFree;
            menu.AllergenInfo = updateDto.AllergenInfo;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await MenuExists(id))
                {
                    return NotFound(new { message = "Menu not found." });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Menus/5
        [AllowAnonymous]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMenu(int id)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null)
            {
                return NotFound(new { message = "Menu not found." });
            }

            _context.Menus.Remove(menu);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Menus/5/availability
        [AllowAnonymous]
        [HttpPatch("{id}/availability")]
        public async Task<IActionResult> ToggleAvailability(int id, [FromBody] bool isAvailable)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null)
            {
                return NotFound(new { message = "Menu not found." });
            }

            menu.IsAvailable = isAvailable;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Menu {(isAvailable ? "enabled" : "disabled")} successfully." });
        }

        private async Task<bool> MenuExists(int id)
        {
            return await _context.Menus.AnyAsync(e => e.Id == id);
        }
    }
}
