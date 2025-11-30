using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using eventra_api.Data;
using eventra_api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Clients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetAllClients()
        {
            var clients = await _context.Clients
                .Where(c => c.IsActive)
                .OrderByDescending(c => c.DateRegistered)
                .Select(c => new ClientDto
                {
                    Id = c.Id,
                    FirstName = c.FirstName,
                    SecondName = c.SecondName,
                    Email = c.Email,
                    Phone = c.Phone,
                    Company = c.Company,
                    Address = c.Address,
                    DateRegistered = c.DateRegistered,
                    IsActive = c.IsActive
                })
                .ToListAsync();

            return Ok(clients);
        }

        // GET: api/Clients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            var clientDto = new ClientDto
            {
                Id = client.Id,
                FirstName = client.FirstName,
                SecondName = client.SecondName,
                Email = client.Email,
                Phone = client.Phone,
                Company = client.Company,
                Address = client.Address,
                DateRegistered = client.DateRegistered,
                IsActive = client.IsActive
            };

            return Ok(clientDto);
        }

        // POST: api/Clients
        [HttpPost]
        public async Task<ActionResult<ClientDto>> CreateClient(CreateClientDto createDto)
        {
            // Check if email already exists
            if (await _context.Clients.AnyAsync(c => c.Email == createDto.Email))
            {
                return BadRequest(new { message = "A client with this email already exists." });
            }

            var client = new Client
            {
                FirstName = createDto.FirstName,
                SecondName = createDto.SecondName,
                Email = createDto.Email,
                Phone = createDto.Phone,
                Company = createDto.Company,
                Address = createDto.Address,
                DateRegistered = DateTime.UtcNow,
                IsActive = true
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            var clientDto = new ClientDto
            {
                Id = client.Id,
                FirstName = client.FirstName,
                SecondName = client.SecondName,
                Email = client.Email,
                Phone = client.Phone,
                Company = client.Company,
                Address = client.Address,
                DateRegistered = client.DateRegistered,
                IsActive = client.IsActive
            };

            return CreatedAtAction(nameof(GetClient), new { id = client.Id }, clientDto);
        }

        // PUT: api/Clients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, UpdateClientDto updateDto)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            // Check if email is being changed and if it already exists for another client
            if (client.Email != updateDto.Email && 
                await _context.Clients.AnyAsync(c => c.Email == updateDto.Email && c.Id != id))
            {
                return BadRequest(new { message = "A client with this email already exists." });
            }

            client.FirstName = updateDto.FirstName;
            client.SecondName = updateDto.SecondName;
            client.Email = updateDto.Email;
            client.Phone = updateDto.Phone;
            client.Company = updateDto.Company;
            client.Address = updateDto.Address;
            client.IsActive = updateDto.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Clients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
