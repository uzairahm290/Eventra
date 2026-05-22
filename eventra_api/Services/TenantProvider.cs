using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace eventra_api.Services
{
    public interface ITenantProvider
    {
        int? GetTenantId();
    }

    public class TenantProvider : ITenantProvider
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TenantProvider(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int? GetTenantId()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return null;

            var tenantIdClaim = user.FindFirst("TenantId")?.Value;
            if (int.TryParse(tenantIdClaim, out var tenantId))
            {
                return tenantId;
            }

            return null;
        }
    }
}