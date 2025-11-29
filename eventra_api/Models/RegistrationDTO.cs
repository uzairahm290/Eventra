using System.ComponentModel.DataAnnotations;

namespace eventra_api.Models
{
    public class RegisterDTO
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string SecondName { get; set; } = string.Empty;
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required]
        [EmailAddress]
        public string UserMail { get; set; } = string.Empty;
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }
}