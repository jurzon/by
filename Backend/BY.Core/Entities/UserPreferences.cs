using BY.Core.Enums;

namespace BY.Core.Entities;

public class UserPreferences : BaseEntity
{
    public Guid UserId { get; set; }
    
    // Notification preferences
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool SmsNotifications { get; set; } = false;
    public TimeOnly QuietHoursStart { get; set; } = new(22, 0); // 10 PM
    public TimeOnly QuietHoursEnd { get; set; } = new(7, 0);   // 7 AM
    
    // Goal defaults
    public GoalCategory[] FavoriteCategories { get; set; } = Array.Empty<GoalCategory>();
    public decimal PreferredStakeAmount { get; set; } = 25.00m;
    public int PreferredGoalDuration { get; set; } = 30; // days
    public TimeOnly PreferredReminderTime { get; set; } = new(7, 0);
    
    // Display preferences
    public string Timezone { get; set; } = "UTC";
    public string Currency { get; set; } = "USD";
    public bool DarkMode { get; set; } = false;
    
    // Privacy settings
    public bool ProfilePublic { get; set; } = false;
    public bool ShowInLeaderboards { get; set; } = true;
    public bool AllowCommunityMessages { get; set; } = true;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
}