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
        public async Task<ActionResult<SearchResultDto>> SearchAll([FromQuery] string? term = null, [FromQuery] string? query = null)
        {
            var q = (term ?? query ?? string.Empty).Trim();
            var result = new SearchResultDto();

            // If no query provided, return recent/top items
            if (string.IsNullOrWhiteSpace(q))
            {
                result.Events = await _context.Events
                    .OrderByDescending(e => e.CreatedAt)
                    .Take(10)
                    .Select(e => new EventDto
                    {
                        Id = e.Id,
                        Title = e.Title,
                        Date = e.Date,
                        EndDate = e.EndDate,
                        Location = e.Location,
                        Description = e.Description,
                        MaxAttendees = e.MaxAttendees,
                        CurrentAttendees = e.CurrentAttendees,
                        Category = e.Category.ToString(),
                        Status = e.Status.ToString(),
                        VenueId = e.VenueId,
                        ImageUrl = e.ImageUrl,
                        TicketPrice = e.TicketPrice,
                        IsFree = e.IsFree,
                        RequiresApproval = e.RequiresApproval,
                        IsPublic = e.IsPublic,
                        OrganizerName = e.OrganizerName,
                        OrganizerEmail = e.OrganizerEmail,
                        OrganizerPhone = e.OrganizerPhone,
                        CreatedBy = e.CreatedBy,
                        CreatedAt = e.CreatedAt,
                        HasAvailableSeats = e.CurrentAttendees < e.MaxAttendees
                    }).ToListAsync();

                result.Venues = await _context.Venues
                    .Where(v => v.IsActive)
                    .OrderByDescending(v => v.CreatedAt)
                    .Take(10)
                    .Select(v => new VenueDto
                    {
                        Id = v.Id,
                        Name = v.Name,
                        Address = v.Address,
                        City = v.City,
                        State = v.State,
                        PostalCode = v.PostalCode,
                        Capacity = v.Capacity,
                        Description = v.Description,
                        ContactPhone = v.ContactPhone,
                        ContactEmail = v.ContactEmail,
                        PricePerHour = v.PricePerHour,
                        IsActive = v.IsActive,
                        EventCount = v.Events.Count
                    }).ToListAsync();

                result.Clients = await _context.Clients
                    .Where(c => c.IsActive)
                    .OrderByDescending(c => c.DateRegistered)
                    .Take(10)
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
                    }).ToListAsync();

                result.Menus = await _context.Menus
                    .Where(m => m.IsAvailable)
                    .OrderByDescending(m => m.CreatedAt)
                    .Take(10)
                    .Select(m => new MenuDto
                    {
                        Id = m.Id,
                        VenueId = m.VenueId,
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
                    }).ToListAsync();

                return Ok(result);
            }

            var keyword = q.ToLower();

            result.Events = await _context.Events
                .Where(e =>
                    EF.Functions.Like(e.Title.ToLower(), $"%{keyword}%") ||
                    EF.Functions.Like(e.Location.ToLower(), $"%{keyword}%") ||
                    EF.Functions.Like(e.Description.ToLower(), $"%{keyword}%"))
                .OrderBy(e => e.Date)
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Date = e.Date,
                    EndDate = e.EndDate,
                    Location = e.Location,
                    Description = e.Description,
                    MaxAttendees = e.MaxAttendees,
                    CurrentAttendees = e.CurrentAttendees,
                    Category = e.Category.ToString(),
                    Status = e.Status.ToString(),
                    VenueId = e.VenueId,
                    ImageUrl = e.ImageUrl,
                    TicketPrice = e.TicketPrice,
                    IsFree = e.IsFree,
                    RequiresApproval = e.RequiresApproval,
                    IsPublic = e.IsPublic,
                    OrganizerName = e.OrganizerName,
                    OrganizerEmail = e.OrganizerEmail,
                    OrganizerPhone = e.OrganizerPhone,
                    CreatedBy = e.CreatedBy,
                    CreatedAt = e.CreatedAt,
                    HasAvailableSeats = e.CurrentAttendees < e.MaxAttendees
                })
                .ToListAsync();

            result.Venues = await _context.Venues
                .Where(v => v.IsActive && (
                    EF.Functions.Like(v.Name.ToLower(), $"%{keyword}%") ||
                    EF.Functions.Like(v.Address!.ToLower(), $"%{keyword}%") ||
                    EF.Functions.Like((v.City ?? "").ToLower(), $"%{keyword}%")
                ))
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City,
                    State = v.State,
                    PostalCode = v.PostalCode,
                    Capacity = v.Capacity,
                    Description = v.Description,
                    ContactPhone = v.ContactPhone,
                    ContactEmail = v.ContactEmail,
                    PricePerHour = v.PricePerHour,
                    IsActive = v.IsActive,
                    EventCount = v.Events.Count
                })
                .ToListAsync();

            result.Clients = await _context.Clients
                .Where(c => c.IsActive && (
                    EF.Functions.Like((c.FirstName + " " + c.SecondName).ToLower(), $"%{keyword}%") ||
                    EF.Functions.Like((c.Company ?? "").ToLower(), $"%{keyword}%") ||
                    EF.Functions.Like(c.Email.ToLower(), $"%{keyword}%")
                ))
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

            result.Menus = await _context.Menus
                .Include(m => m.Venue)
                .Where(m => m.IsAvailable && (
                    EF.Functions.Like(m.Name.ToLower(), $"%{keyword}%") ||
                    EF.Functions.Like((m.Category ?? "").ToLower(), $"%{keyword}%")
                ))
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

            return Ok(result);
        }
    }
}