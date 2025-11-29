using Microsoft.AspNetCore.Identity;
using System;
namespace eventra_api.Models
{
    // ApplicationUser inherits from IdentityUser, giving it properties like UserName, Email, and PasswordHash
    public class ApplicationUser : IdentityUser
    {
        // Add custom properties here (e.g., for profile customization)
        public string FirstName { get; set; } = string.Empty;
        public string SecondName { get; set; } = string.Empty;
        public DateTime DateRegistered { get; set; } = DateTime.Now;
    }
}