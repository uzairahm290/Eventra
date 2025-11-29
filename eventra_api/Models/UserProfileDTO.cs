using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class UserProfileDto
    {
        public string? FirstName { get; set; }
        public string? SecondName { get; set; }
        public string? UserName { get; set; }
        [EmailAddress]
        public string? UserMail { get; set; }
        public string? ProfileImageBase64 { get; set; }

    }
}