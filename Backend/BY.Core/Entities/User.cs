using BY.Core.Enums;

namespace BY.Core.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsEmailVerified { get; set; } = false;
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime? LastLoginAt { get; set; }
    
    // Default preferences for quick goal setup
    public TimeOnly DefaultReminderTime { get; set; } = new(7, 0); // 7 AM
    public GoalCategory[] PreferredCategories { get; set; } = Array.Empty<GoalCategory>();
    public decimal DefaultStakeAmount { get; set; } = 25.00m;

    // Navigation properties
    public virtual ICollection<Goal> Goals { get; set; } = new List<Goal>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual UserPreferences? Preferences { get; set; }
    
    // Computed properties
    public string FullName => $"{FirstName} {LastName}".Trim();
}