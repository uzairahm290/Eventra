using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using eventra_api.Models;
using eventra_api.Services; // Required for TokenService
using System.Threading.Tasks;
using System.Linq;
using System.ComponentModel.DataAnnotations; // Required for DTOs
using System.Collections.Generic;
using System.Net;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly TokenService _tokenService;
        private readonly IEmailService _emailService;

        // Dependency Injection: Gets the necessary Identity and Token services
        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            TokenService tokenService,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailService = emailService;
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
                // Assign default User role
                await _userManager.AddToRoleAsync(user, "User");
                var roles = await _userManager.GetRolesAsync(user);
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
                        profileImageBase64 = user.ProfileImageBase64,
                        role = roles.FirstOrDefault() ?? "User"
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
            ApplicationUser? user = null;

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

            // Block login for users who are not yet approved by admin
            if (!user.IsApproved)
            {
                return StatusCode(403, new { message = "Your account is awaiting admin approval." });
            }

            // 2. Check password against the user found by identifier
            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (result.Succeeded)
            {
                var roles = await _userManager.GetRolesAsync(user);
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
                        profileImageBase64 = user.ProfileImageBase64,
                        role = roles.FirstOrDefault() ?? "User"
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
                userName = u.UserName,
                isApproved = u.IsApproved,
                role = _userManager.GetRolesAsync(u).Result.FirstOrDefault() ?? "User"
            }).ToList();

            return Ok(new { message = "Users retrieved successfully!", users = userList });
        }

        // ------------------------------------------------------------------
        // FORGOT PASSWORD - Request Reset (POST /api/Auth/ForgotPassword)
        // ------------------------------------------------------------------
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // For security, return success even if user doesn't exist
                return Ok(new { message = "If an account with that email exists, a reset link has been sent." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            // Build reset link (frontend route expected to handle token parameters)
            var frontendBase = Request.Headers.ContainsKey("Origin") ? Request.Headers["Origin"].ToString() : "http://localhost:5173";
            var resetUrl = $"{frontendBase}/reset-password?userId={WebUtility.UrlEncode(user.Id)}&token={WebUtility.UrlEncode(token)}";

            await _emailService.SendEmailAsync(user.Email, "Reset your Eventra password",
                $"<p>Hello {WebUtility.HtmlEncode(user.FirstName ?? user.UserName)},</p>" +
                $"<p>We received a request to reset your password. Click the button below to proceed:</p>" +
                $"<p><a href='{resetUrl}' style='display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px'>Reset Password</a></p>" +
                $"<p>If you didn’t request this, you can safely ignore this email.</p>"
            );

            // Return generic success without exposing token
            return Ok(new { message = "If an account with that email exists, a reset link has been sent." });
        }

        // ------------------------------------------------------------------
        // RESET PASSWORD - Confirm with Token (POST /api/Auth/ResetPassword)
        // ------------------------------------------------------------------
        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "Invalid reset request." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { message = "Password has been reset successfully." });
            }

            return BadRequest(new { message = "Password reset failed.", errors = result.Errors });
        }

        // ------------------------------------------------------------------
        // ADMIN: APPROVE USER (POST /api/Auth/ApproveUser/{userId})
        // ------------------------------------------------------------------
        [HttpPost("ApproveUser/{userId}")]
        public async Task<IActionResult> ApproveUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.IsApproved = true;
            var result = await _userManager.UpdateAsync(user);
            
            if (result.Succeeded)
            {
                return Ok(new { message = "User approved successfully." });
            }

            return BadRequest(new { message = "Failed to approve user.", errors = result.Errors });
        }

        // ------------------------------------------------------------------
        // ADMIN: REJECT USER (POST /api/Auth/RejectUser/{userId})
        // ------------------------------------------------------------------
        [HttpPost("RejectUser/{userId}")]
        public async Task<IActionResult> RejectUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.IsApproved = false;
            var result = await _userManager.UpdateAsync(user);
            
            if (result.Succeeded)
            {
                return Ok(new { message = "User approval revoked." });
            }

            return BadRequest(new { message = "Failed to update user.", errors = result.Errors });
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

    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        [DataType(DataType.Password)]
        public string NewPassword { get; set; } = string.Empty;
    }
}