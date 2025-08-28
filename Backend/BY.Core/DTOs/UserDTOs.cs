using BY.Core.Enums;

namespace BY.Core.DTOs;

// Request DTOs
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public TimeOnly? DefaultReminderTime { get; set; }
    public GoalCategory[]? PreferredCategories { get; set; }
    public decimal? DefaultStakeAmount { get; set; }
}

// Response DTOs
public class UserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public UserRole Role { get; set; }
    public TimeOnly DefaultReminderTime { get; set; }
    public GoalCategory[] PreferredCategories { get; set; } = Array.Empty<GoalCategory>();
    public decimal DefaultStakeAmount { get; set; }
    public int TotalGoals { get; set; }
    public int CompletedGoals { get; set; }
    public int ActiveGoals { get; set; }
    public decimal TotalStaked { get; set; }
    public decimal TotalPaid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserResponse User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}