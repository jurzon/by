using BY.Core.Enums;

namespace BY.Core.Entities;

public class Goal : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public GoalCategory Category { get; set; }
    public GoalStatus Status { get; set; } = GoalStatus.Active;
    
    // Timeline
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DurationDays { get; set; }
    
    // Financial stakes
    public decimal TotalStakeAmount { get; set; }
    public decimal DailyStakeAmount { get; set; }
    
    // Reminders
    public TimeOnly ReminderTime { get; set; }
    public string ReminderMessage { get; set; } = string.Empty;
    
    // Progress tracking
    public int SuccessfulDays { get; set; } = 0;
    public int FailedDays { get; set; } = 0;
    public int MissedDays { get; set; } = 0;
    public int CurrentStreak { get; set; } = 0;
    public int LongestStreak { get; set; } = 0;
    public decimal TotalPaid { get; set; } = 0;
    
    // Goal completion
    public DateTime? CompletedAt { get; set; }
    public bool IsSuccessful { get; set; } = false;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    
    // Computed properties
    public decimal ProgressPercentage => DurationDays > 0 ? (decimal)(SuccessfulDays + FailedDays) / DurationDays * 100 : 0;
    public decimal SuccessRate => (SuccessfulDays + FailedDays) > 0 ? (decimal)SuccessfulDays / (SuccessfulDays + FailedDays) * 100 : 0;
    public bool IsActive => Status == GoalStatus.Active && DateTime.UtcNow <= EndDate;
    public bool IsCompleted => Status == GoalStatus.Completed || DateTime.UtcNow > EndDate;
}