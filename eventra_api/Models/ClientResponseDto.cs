using System;

namespace eventra_api.Models
{
    // DTO for returning Client data (hides sensitive fields like PasswordHash)
    public class ClientResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;

        // MATCHES YOUR APPLICATIONUSER/AUTHCONTROLLER CONVENTION
        public string SecondName { get; set; } = string.Empty;

        public string? Email { get; set; }
        public string? UserName { get; set; }
        public DateTime DateRegistered { get; set; }
    }
}