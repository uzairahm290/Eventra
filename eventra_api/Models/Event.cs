// File: Models/Event.cs

namespace eventra_api.Models
{
    public class Event
    {
        // 1. Primary Key: The unique ID for each event record.
        public int Id { get; set; }

        // 2. Event Details
        public string Title { get; set; } = string.Empty; // Title of the event (e.g., "Tech Meetup")
        public DateTime Date { get; set; }                // When the event happens
        public string Location { get; set; } = string.Empty; // Where the event happens
        public string Description { get; set; } = string.Empty; // Short description

        // 3. Status/Capacity
        public int MaxAttendees { get; set; }
    }
}