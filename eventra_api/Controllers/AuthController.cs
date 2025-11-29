using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using eventra_api.Models;
using eventra_api.Services; // Required for TokenService
using System.Threading.Tasks;
using System.Linq;
using System.ComponentModel.DataAnnotations; // Required for DTOs
using System.Collections.Generic;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly TokenService _tokenService;

        // Dependency Injection: Gets the necessary Identity and Token services
        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            TokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        // ------------------------------------------------------------------
        // REGISTRATION / SIGNUP (POST /api/Auth/Register)
        // ------------------------------------------------------------------
        [HttpPost("Register")]
        // Uses the new RegisterDTO
        public async Task<IActionResult> Register([FromBody] RegisterDTO model)
        {
            // Check if user exists by Email or Username
            if (await _userManager.FindByEmailAsync(model.UserMail) != null)
            {
                return BadRequest(new { message = "User with this email already exists." });
            }
            if (await _userManager.FindByNameAsync(model.UserName) != null)
            {
                return BadRequest(new { message = "User with this username already exists." });
            }

            // NOTE: Assuming ApplicationUser has a property called 'LastName'
            var user = new ApplicationUser
            {
                // Map UserMail to the Identity system's Email field
                Email = model.UserMail,
                // Map UserName to the Identity system's UserName field
                UserName = model.UserName,

                FirstName = model.FirstName,
                // Map SecondName from DTO to LastName in ApplicationUser model
                SecondName = model.SecondName,

                DateRegistered = System.DateTime.Now
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                var token = _tokenService.CreateToken(user);

                return Ok(new
                {
                    message = "User registered successfully!",
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        // Use the actual ApplicationUser property name (LastName)
                        lastName = user.SecondName,
                        dateRegistered = user.DateRegistered,
                        profileImageBase64 = user.ProfileImageBase64
                    }
                });
            }

            return BadRequest(new { message = "Registration failed.", errors = result.Errors });
        }

        // ------------------------------------------------------------------
        // LOGIN (POST /api/Auth/Login) - NOW RETURNS JWT TOKEN
        // ------------------------------------------------------------------
        [HttpPost("Login")]
        // Uses the new LoginDto
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            ApplicationUser user = null;

            // 1. Determine login identifier (UserMail or UserName)
            if (!string.IsNullOrEmpty(model.UserMail))
            {
                user = await _userManager.FindByEmailAsync(model.UserMail);
            }
            else if (!string.IsNullOrEmpty(model.UserName))
            {
                user = await _userManager.FindByNameAsync(model.UserName);
            }
            else
            {
                return BadRequest(new { message = "Must provide either UserName or UserMail." });
            }

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials." }); // HTTP 401
            }

            // 2. Check password against the user found by identifier
            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (result.Succeeded)
            {
                var token = _tokenService.CreateToken(user);

                return Ok(new
                {
                    message = "Login successful!",
                    token = token, // <-- JWT Token
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        // Use the actual ApplicationUser property name (LastName)
                        lastName = user.SecondName,
                        dateRegistered = user.DateRegistered,
                        profileImageBase64 = user.ProfileImageBase64
                    }
                });
            }

            return Unauthorized(new { message = "Invalid credentials." }); // HTTP 401
        }

        // ------------------------------------------------------------------
        // GET ALL USERS (GET /api/Auth/Users)
        // ------------------------------------------------------------------
        [HttpGet("Users")]
        public IActionResult GetAllUsers()
        {
            var users = _userManager.Users.ToList();

            if (users.Count == 0)
            {
                return Ok(new { message = "No users found.", users = new List<object>() });
            }

            var userList = users.Select(u => new
            {
                id = u.Id,
                email = u.Email,
                firstName = u.FirstName,
                // Use the actual ApplicationUser property name (LastName)
                lastName = u.SecondName,
                dateRegistered = u.DateRegistered,
                userName = u.UserName
            }).ToList();

            return Ok(new { message = "Users retrieved successfully!", users = userList });
        }
    }

    // =================================================================
    // DTOs (Data Transfer Objects) - Now integrated into the same file
    // =================================================================

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

    public class LoginDto
    {
        // One of these should be supplied, but both are nullable
        public string? UserName { get; set; }
        public string? UserMail { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }
}