using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using eventra_api.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace eventra_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ProfileController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(new UserProfileDto
            {
                UserMail = user.Email,
                UserName = user.UserName,
                FirstName = user.FirstName,
                SecondName = user.SecondName,
                ProfileImageBase64 = user.ProfileImageBase64
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile(UserProfileDto profileDto)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (profileDto.UserMail != null && profileDto.UserMail != user.Email)
            {
                return BadRequest(new
                {
                    message = "Email change must be initiated via the secure 'request-email-change' endpoint."
                });
            }

            if (profileDto.FirstName != null) user.FirstName = profileDto.FirstName;
            if (profileDto.SecondName != null) user.SecondName = profileDto.SecondName;
            if (profileDto.ProfileImageBase64 != null) user.ProfileImageBase64 = profileDto.ProfileImageBase64;

            if (profileDto.UserName != null && profileDto.UserName != user.UserName)
            {
                var setUserNameResult = await _userManager.SetUserNameAsync(user, profileDto.UserName);

                if (!setUserNameResult.Succeeded)
                {
                    var errors = setUserNameResult.Errors.Select(e => e.Description);
                    return BadRequest(new { Message = "Username update failed.", Errors = errors });
                }
            }

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(new { Message = "Profile update failed.", Errors = errors });
            }

            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpPost("request-email-change")]
        public async Task<IActionResult> RequestEmailChange([FromBody] UserProfileDto model)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null) return NotFound("User not found.");

            if (string.IsNullOrEmpty(model.UserMail))
            {
                return BadRequest(new { message = "New email address must be provided in the UserMail field." });
            }

            if (user.Email == model.UserMail) return BadRequest(new { message = "New email is the same as the current email." });

            var token = await _userManager.GenerateChangeEmailTokenAsync(user, model.UserMail);

            return Ok(new { message = "Confirmation link sent to the new email address." });
        }

        [AllowAnonymous]
        [HttpPost("confirm-email-change")]
        public async Task<IActionResult> ConfirmEmailChange([FromQuery] string userId, [FromQuery] string email, [FromQuery] string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return BadRequest(new { message = "User not found." });

            var decodedToken = HttpUtility.UrlDecode(token);

            var result = await _userManager.ChangeEmailAsync(user, email, decodedToken);

            if (result.Succeeded)
            {
                await _userManager.UpdateSecurityStampAsync(user);
                return Ok(new { message = "Email address successfully updated and confirmed." });
            }

            var errors = result.Errors.Select(e => e.Description);
            return BadRequest(new { message = "Email change confirmation failed.", Errors = errors });
        }
    }
}