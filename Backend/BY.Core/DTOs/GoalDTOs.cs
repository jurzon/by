using BY.Core.Enums;

namespace BY.Core.DTOs;

// Request DTOs
public class CreateGoalRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public GoalCategory Category { get; set; }
    public int DurationDays { get; set; }
    public decimal TotalStakeAmount { get; set; }
    public TimeOnly ReminderTime { get; set; }
    public string ReminderMessage { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
}

public class UpdateGoalRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TimeOnly? ReminderTime { get; set; }
    public string? ReminderMessage { get; set; }
}

public class CheckInRequest
{
    public bool Completed { get; set; }
    public string? Notes { get; set; }
}

// Response DTOs
public class GoalResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public GoalCategory Category { get; set; }
    public GoalStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DurationDays { get; set; }
    public decimal TotalStakeAmount { get; set; }
    public decimal DailyStakeAmount { get; set; }
    public TimeOnly ReminderTime { get; set; }
    public int SuccessfulDays { get; set; }
    public int FailedDays { get; set; }
    public int MissedDays { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal ProgressPercentage { get; set; }
    public decimal SuccessRate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CheckInResponse
{
    public Guid Id { get; set; }
    public Guid GoalId { get; set; }
    public DateOnly Date { get; set; }
    public bool Completed { get; set; }
    public string? Notes { get; set; }
    public DateTime CheckInTime { get; set; }
    public bool PaymentProcessed { get; set; }
    public decimal? AmountCharged { get; set; }
    public int StreakCount { get; set; }
    public string? Message { get; set; }
}