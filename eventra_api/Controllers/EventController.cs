using eventra_api.Data;
using eventra_api.Models;
using Microsoft.AspNetCore.Authorization; // <-- Already in your code!
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eventra_api.Controllers
{
    // Sets the base URL to: /api/Events
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Constructor: Injects the AppDbContext (database bridge)
        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        // ------------------------------------------------------------------
        // READ ALL EVENTS (GET /api/Events) - PUBLIC
        // ------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            return await _context.Events.ToListAsync();
        }

        // ------------------------------------------------------------------
        // READ SINGLE EVENT BY ID (GET /api/Events/{id}) - PUBLIC
        // ------------------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);

            if (eventItem == null)
            {
                return NotFound(); // HTTP 404
            }

            return eventItem;
        }

        // ------------------------------------------------------------------
        // CREATE A NEW EVENT (POST /api/Events) - SECURED
        // ------------------------------------------------------------------
        [Authorize] // <-- NEW: Requires a valid JWT Token
        [HttpPost]
        public async Task<ActionResult<Event>> PostEvent(Event eventItem)
        {
            _context.Events.Add(eventItem);
            await _context.SaveChangesAsync();

            // Returns HTTP 201 Created status
            return CreatedAtAction(nameof(GetEvent), new { id = eventItem.Id }, eventItem);
        }

        // ------------------------------------------------------------------
        // UPDATE AN EXISTING EVENT (PUT /api/Events/{id}) - SECURED
        // ------------------------------------------------------------------
        [Authorize] // <-- NEW: Requires a valid JWT Token
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvent(int id, Event eventItem)
        {
            if (id != eventItem.Id)
            {
                return BadRequest(); // HTTP 400: ID in route doesn't match ID in body
            }

            // Tells Entity Framework Core the entity has been modified
            _context.Entry(eventItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Checks if the record still exists before throwing an error
                if (!_context.Events.Any(e => e.Id == id))
                {
                    return NotFound(); // HTTP 404: Record not found
                }
                else
                {
                    throw; // Throw other database concurrency errors
                }
            }

            return NoContent(); // HTTP 204: Success, no content needed in response
        }

        // ------------------------------------------------------------------
        // DELETE AN EVENT (DELETE /api/Events/{id}) - SECURED
        // ------------------------------------------------------------------
        [Authorize] // <-- NEW: Requires a valid JWT Token
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
            {
                return NotFound(); // HTTP 404
            }

            _context.Events.Remove(eventItem);
            await _context.SaveChangesAsync();

            return NoContent(); // HTTP 204: Success, no content
        }
    }
}