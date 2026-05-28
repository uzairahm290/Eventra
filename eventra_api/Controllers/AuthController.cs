using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using eventra_api.Models;
using eventra_api.Services;
using System.Threading.Tasks;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

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
        private readonly eventra_api.Data.AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            TokenService tokenService,
            IEmailService emailService,
            eventra_api.Data.AppDbContext context,
            IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailService = emailService;
            _context = context;
            _config = config;
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
                // Multi-tenancy support
                string roleToAssign = "Manager";
                if (!string.IsNullOrEmpty(model.BusinessName))
                {
                    var tenant = new Tenant
                    {
                        Name = model.BusinessName,
                        ContactEmail = model.UserMail
                    };
                    _context.Tenants.Add(tenant);
                    await _context.SaveChangesAsync();

                    user.TenantId = tenant.Id;
                    user.IsApproved = true; // Owner is auto-approved
                    await _userManager.UpdateAsync(user);

                    roleToAssign = "Owner";
                }

                // Call RoleManager to ensure basic roles exist
                await _userManager.AddToRoleAsync(user, roleToAssign);
                
                var roles = await _userManager.GetRolesAsync(user);
                var token = await _tokenService.CreateTokenAsync(user);

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
                        dateRegistered = user.DateRegistered,
                        profileImageBase64 = user.ProfileImageBase64,
                        role = roles.FirstOrDefault() ?? "Manager",
                        venueId = user.VenueId,
                        tenantId = user.TenantId
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
                var token = await _tokenService.CreateTokenAsync(user);

                return Ok(new
                {
                    message = "Login successful!",
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.SecondName,
                        dateRegistered = user.DateRegistered,
                        profileImageBase64 = user.ProfileImageBase64,
                        role = roles.FirstOrDefault() ?? "Manager",
                        venueId = user.VenueId,
                        tenantId = user.TenantId
                    }
                });
            }

            return Unauthorized(new { message = "Invalid credentials." }); // HTTP 401
        }

        // ------------------------------------------------------------------
        // GET ALL USERS (GET /api/Auth/Users) - Owner only
        // ------------------------------------------------------------------
        [HttpGet("Users")]
        [Authorize(Roles = "Owner")]
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
                userName = u.UserName,
                isApproved = u.IsApproved,
                venueId = u.VenueId,
                tenantId = u.TenantId,
                role = _userManager.GetRolesAsync(u).Result.FirstOrDefault() ?? "Manager"
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

            await _emailService.SendEmailAsync(user.Email!, "Reset your Eventra password",
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
        // OWNER: APPROVE USER (POST /api/Auth/ApproveUser/{userId})
        // ------------------------------------------------------------------
        [HttpPost("ApproveUser/{userId}")]
        [Authorize(Roles = "Owner")]
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
        // OWNER: REJECT USER (POST /api/Auth/RejectUser/{userId})
        // ------------------------------------------------------------------
        [HttpPost("RejectUser/{userId}")]
        [Authorize(Roles = "Owner")]
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

        // ------------------------------------------------------------------
        // GOOGLE LOGIN (POST /api/Auth/GoogleLogin)
        // Validates a Google ID token issued by the frontend (Google Identity
        // Services) and returns an Eventra JWT. Requires VITE_GOOGLE_CLIENT_ID
        // on the frontend and Google:ClientId in appsettings / env vars.
        // ------------------------------------------------------------------
        [HttpPost("GoogleLogin")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto model)
        {
            GoogleTokenPayload? payload;
            try
            {
                using var http = new HttpClient();
                var response = await http.GetAsync(
                    $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(model.IdToken)}");

                if (!response.IsSuccessStatusCode)
                    return Unauthorized(new { message = "Invalid Google token." });

                payload = await response.Content.ReadFromJsonAsync<GoogleTokenPayload>();
            }
            catch
            {
                return Unauthorized(new { message = "Could not validate Google token." });
            }

            if (payload == null || string.IsNullOrEmpty(payload.Email))
                return Unauthorized(new { message = "Invalid Google token payload." });

            // Verify the token was issued for our app
            var expectedClientId = _config["Google:ClientId"];
            if (!string.IsNullOrWhiteSpace(expectedClientId) && payload.Aud != expectedClientId)
                return Unauthorized(new { message = "Token audience mismatch." });

            var user = await _userManager.FindByEmailAsync(payload.Email);
            if (user == null)
            {
                // Auto-create account linked to Google
                user = new ApplicationUser
                {
                    Email = payload.Email,
                    UserName = payload.Email.Split('@')[0],
                    FirstName = payload.GivenName ?? payload.Name?.Split(' ')[0] ?? "User",
                    SecondName = payload.FamilyName ?? "",
                    EmailConfirmed = true,
                    IsApproved = false, // Needs Owner approval like any other Manager
                    DateRegistered = System.DateTime.UtcNow,
                };
                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(new { message = "Failed to create account.", errors = result.Errors });

                await _userManager.AddToRoleAsync(user, "Manager");
            }

            if (!user.IsApproved)
                return StatusCode(403, new { message = "Your account is awaiting admin approval." });

            var roles = await _userManager.GetRolesAsync(user);
            var token = await _tokenService.CreateTokenAsync(user);

            return Ok(new
            {
                message = "Login successful!",
                token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.SecondName,
                    dateRegistered = user.DateRegistered,
                    profileImageBase64 = user.ProfileImageBase64,
                    role = roles.FirstOrDefault() ?? "Manager",
                    venueId = user.VenueId,
                    tenantId = user.TenantId
                }
            });
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

        // Multi-Tenancy support
        public string? BusinessName { get; set; }
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

    public class GoogleLoginDto
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }

    public class GoogleTokenPayload
    {
        [JsonPropertyName("sub")] public string Sub { get; set; } = string.Empty;
        [JsonPropertyName("email")] public string Email { get; set; } = string.Empty;
        [JsonPropertyName("name")] public string? Name { get; set; }
        [JsonPropertyName("given_name")] public string? GivenName { get; set; }
        [JsonPropertyName("family_name")] public string? FamilyName { get; set; }
        [JsonPropertyName("aud")] public string Aud { get; set; } = string.Empty;
    }
}