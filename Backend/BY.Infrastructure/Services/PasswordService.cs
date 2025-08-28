using BY.Core.Interfaces;
using BCrypt.Net;

namespace BY.Infrastructure.Services;

public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }

    public bool IsPasswordValid(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return false;

        // Password requirements
        if (password.Length < 8)
            return false;

        // Must contain at least one uppercase letter
        if (!password.Any(char.IsUpper))
            return false;

        // Must contain at least one lowercase letter
        if (!password.Any(char.IsLower))
            return false;

        // Must contain at least one digit
        if (!password.Any(char.IsDigit))
            return false;

        // Must contain at least one special character
        if (!password.Any(c => !char.IsLetterOrDigit(c)))
            return false;

        return true;
    }

    public string GenerateResetToken()
    {
        return Guid.NewGuid().ToString("N");
    }
}