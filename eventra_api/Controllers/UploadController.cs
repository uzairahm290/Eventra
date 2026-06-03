using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace eventra_api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IConfiguration config, ILogger<UploadController> logger)
        {
            _config = config;
            _logger = logger;
        }

        // POST /api/Upload/avatar
        // Accepts a multipart file, uploads to Cloudinary (if configured) or falls back to base64.
        // Required env vars for Cloudinary: Cloudinary__CloudName, Cloudinary__ApiKey, Cloudinary__ApiSecret
        [HttpPost("avatar")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5 MB
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            if (!file.ContentType.StartsWith("image/"))
                return BadRequest(new { message = "Only image files are allowed." });

            var cloudName = _config["Cloudinary:CloudName"];
            var apiKey = _config["Cloudinary:ApiKey"];
            var apiSecret = _config["Cloudinary:ApiSecret"];

            if (!string.IsNullOrWhiteSpace(cloudName) &&
                !string.IsNullOrWhiteSpace(apiKey) &&
                !string.IsNullOrWhiteSpace(apiSecret))
            {
                return await UploadToCloudinary(file, cloudName, apiKey, apiSecret);
            }

            // Cloudinary not configured — return base64 data URL so existing UI still works
            return await FallbackBase64(file);
        }

        private async Task<IActionResult> UploadToCloudinary(IFormFile file, string cloudName, string apiKey, string apiSecret)
        {
            try
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                var cloudinary = new Cloudinary(account) { Api = { Secure = true } };

                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "eventra/avatars",
                    Transformation = new Transformation()
                        .Width(256).Height(256).Crop("fill").Quality("auto").FetchFormat("auto"),
                };

                var result = await cloudinary.UploadAsync(uploadParams);

                if (result.Error != null)
                {
                    _logger.LogError("Cloudinary upload error: {Msg}", result.Error.Message);
                    return await FallbackBase64(file);
                }

                return Ok(new { url = result.SecureUrl.ToString(), publicId = result.PublicId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cloudinary upload exception");
                return await FallbackBase64(file);
            }
        }

        private async Task<IActionResult> FallbackBase64(IFormFile file)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var base64 = Convert.ToBase64String(ms.ToArray());
            return Ok(new { url = $"data:{file.ContentType};base64,{base64}" });
        }
    }
}
