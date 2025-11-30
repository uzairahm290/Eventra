using System.Collections.Generic;

namespace eventra_api.Models
{
    public class SearchResultDto
    {
        public List<EventDto> Events { get; set; } = new List<EventDto>();
        public List<VenueDto> Venues { get; set; } = new List<VenueDto>();
        public List<ClientDto> Clients { get; set; } = new List<ClientDto>();
        public List<MenuDto> Menus { get; set; } = new List<MenuDto>();
    }
}
