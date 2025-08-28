using BY.Core.Enums;

namespace BY.Core.DTOs;

public class GoalStatsResponse
{
    public Guid GoalId { get; set; }
    public int TotalDays { get; set; }
    public int SuccessfulDays { get; set; }
    public int FailedDays { get; set; }
    public int MissedDays { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public decimal SuccessRate { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalStaked { get; set; }
    public List<DailyProgressResponse> DailyProgress { get; set; } = new();
}

public class DailyProgressResponse
{
    public DateOnly Date { get; set; }
    public bool? Completed { get; set; }
    public string? Notes { get; set; }
    public decimal? AmountPaid { get; set; }
    public int StreakCount { get; set; }
}

public class PaymentResponse
{
    public Guid Id { get; set; }
    public Guid? GoalId { get; set; }
    public string? GoalTitle { get; set; }
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? Notes { get; set; }
    public string? CharityName { get; set; }
}

public class UserStatsResponse
{
    public Guid UserId { get; set; }
    public int TotalGoals { get; set; }
    public int ActiveGoals { get; set; }
    public int CompletedGoals { get; set; }
    public int FailedGoals { get; set; }
    public decimal OverallSuccessRate { get; set; }
    public decimal TotalStaked { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalRefunded { get; set; }
    public int CurrentLongestStreak { get; set; }
    public int AllTimeLongestStreak { get; set; }
    public GoalCategory FavoriteCategory { get; set; }
    public List<MonthlyStatsResponse> MonthlyStats { get; set; } = new();
}

public class MonthlyStatsResponse
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int GoalsCreated { get; set; }
    public int GoalsCompleted { get; set; }
    public decimal AmountStaked { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal SuccessRate { get; set; }
}