using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")] 
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> SearchEvents([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
            {
                return Ok(await _context.Events.ToListAsync());
            }

            var searchKeyword = term.ToLower();

            var events = await _context.Events
                .Where(e =>
                    e.Title.ToLower().Contains(searchKeyword) ||
                    e.Location.ToLower().Contains(searchKeyword) ||
                    e.Description.ToLower().Contains(searchKeyword))
                .OrderBy(e => e.Date) 
                .ToListAsync();

            if (!events.Any())
            {
                return NotFound(new { message = $"No events found matching '{term}'." });
            }

            return Ok(events);
        }
    }
}