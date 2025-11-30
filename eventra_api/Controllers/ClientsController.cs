using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using eventra_api.Models;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic; // To use List<T>

namespace eventra_api.Controllers
{
    // Restricting access to this entire controller to only Admins
    // NOTE: This will require the 'Admin' role to exist in your database.
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")] // Base URL: /api/Clients
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        // Dependency Injection: Gets the UserManager service
        public ClientsController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        // ------------------------------------------------------------------
        // GET ALL CLIENTS (GET /api/Clients) - Only accessible by Admin
        // ------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetAllClients()
        {
            var allUsers = await _userManager.Users.ToListAsync();
            var clientUsers = new List<ClientResponseDto>();

            // Iterate through all users to check if they have the 'Client' role
            foreach (var user in allUsers)
            {
                // NOTE: The 'Client' role must be created and assigned for this filter to work.
                // We are assuming a "Client" role for all non-Admins/Managers.
                if (await _userManager.IsInRoleAsync(user, "Client"))
                {
                    clientUsers.Add(new ClientResponseDto
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        SecondName = user.SecondName, // MATCHES CONVENTION
                        Email = user.Email,
                        UserName = user.UserName,
                        DateRegistered = user.DateRegistered
                    });
                }
            }

            return Ok(clientUsers);
        }

        // ------------------------------------------------------------------
        // GET SINGLE CLIENT (GET /api/Clients/{id}) - Only accessible by Admin
        // ------------------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientResponseDto>> GetClient(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            // Check if user exists AND has the "Client" role
            if (user == null || !await _userManager.IsInRoleAsync(user, "Client"))
            {
                return NotFound(new { message = "Client not found or user is not designated as a Client." });
            }

            return Ok(new ClientResponseDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                SecondName = user.SecondName, // MATCHES CONVENTION
                Email = user.Email,
                UserName = user.UserName,
                DateRegistered = user.DateRegistered
            });
        }

        // ------------------------------------------------------------------
        // DELETE CLIENT (DELETE /api/Clients/{id}) - Only accessible by Admin
        // ------------------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            // Check if user exists AND has the "Client" role
            if (user == null || !await _userManager.IsInRoleAsync(user, "Client"))
            {
                return NotFound(new { message = "Client not found." });
            }

            // Remove user from database
            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                return NoContent(); // HTTP 204
            }

            return BadRequest(new { message = "Failed to delete client.", errors = result.Errors });
        }
    }
}