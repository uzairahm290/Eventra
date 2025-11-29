using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using eventra_api.Models;
using eventra_api.Services; // <-- NEW: Required for TokenService
using System.Threading.Tasks;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly TokenService _tokenService; // <-- NEW: Declare the TokenService

        // Dependency Injection: Gets the necessary Identity and Token services
        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            TokenService tokenService) // <-- NEW: Inject TokenService
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService; // <-- Assign the injected service
        }

        // ------------------------------------------------------------------
        // REGISTRATION / SIGNUP (POST /api/Auth/Register)
        // ------------------------------------------------------------------
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto model)
        {
            if (await _userManager.FindByEmailAsync(model.Email) != null)
            {
                return BadRequest(new { message = "User with this email already exists." });
            }

            var user = new ApplicationUser
            {
                Email = model.Email,
                UserName = model.Email,
                FirstName = model.FirstName,
                SecondName = model.LastName,
                DateRegistered = DateTime.Now
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                // After successful registration, generate and return the JWT token
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
                        lastName = user.SecondName,
                        dateRegistered = user.DateRegistered
                    }
                });
            }

            return BadRequest(new { message = "Registration failed.", errors = result.Errors });
        }

        // ------------------------------------------------------------------
        // LOGIN (POST /api/Auth/Login) - NOW RETURNS JWT TOKEN
        // ------------------------------------------------------------------
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return Unauthorized("Invalid credentials."); // HTTP 401
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (result.Succeeded)
            {
                // CHANGE: Instead of a simple message, generate and return the JWT token
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
                        lastName = user.SecondName,
                        dateRegistered = user.DateRegistered
                    }
                });
            }

            return Unauthorized("Invalid credentials."); // HTTP 401
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
                lastName = u.SecondName,
                dateRegistered = u.DateRegistered,
                userName = u.UserName
            }).ToList();

            return Ok(new { message = "Users retrieved successfully!", users = userList });
        }
    }

    // DTOs (Data Transfer Objects)
    public class RegisterRequestDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}