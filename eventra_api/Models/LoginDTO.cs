using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class LoginDto
    {
        public string? UserName { get; set; }
        public string? UserMail { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }
}