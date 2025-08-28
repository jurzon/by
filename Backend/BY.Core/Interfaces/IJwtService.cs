using System.Security.Claims;

namespace BY.Core.Interfaces;

public interface IJwtService
{
    string GenerateToken(Guid userId, string email, string role);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
    bool ValidateRefreshToken(string refreshToken);
    DateTime GetTokenExpiration(string token);
}