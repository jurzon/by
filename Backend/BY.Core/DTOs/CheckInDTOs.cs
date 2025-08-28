using BY.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace BY.Core.DTOs;

/// <summary>
/// Request DTO for the 3-button check-in system
/// </summary>
public class ThreeButtonCheckInRequest
{
    [Required]
    public Guid GoalId { get; set; }
    
    [Required]
    public CheckInResult Result { get; set; }
    
    public string? Notes { get; set; }
    
    public DateOnly? Date { get; set; } // Optional, defaults to today
}

/// <summary>
/// Request DTO for updating a check-in
/// </summary>
public class UpdateCheckInRequest
{
    public CheckInResult? Result { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Request DTO for getting check-ins with filters
/// </summary>
public class GetCheckInsRequest : PagedRequest
{
    public Guid? GoalId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool? Completed { get; set; }
    public bool? PaymentProcessed { get; set; }
}

/// <summary>
/// Response DTO for check-in statistics and progress
/// </summary>
public class CheckInStatsResponse
{
    public Guid GoalId { get; set; }
    public string GoalTitle { get; set; } = string.Empty;
    public int TotalCheckIns { get; set; }
    public int CompletedCheckIns { get; set; }
    public int FailedCheckIns { get; set; }
    public double CompletionRate { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public decimal TotalAmountCharged { get; set; }
    public CheckInResponse? LastCheckIn { get; set; }
    public CheckInResponse? TodayCheckIn { get; set; }
}

/// <summary>
/// Request DTO for today's check-in
/// </summary>
public class TodayCheckInRequest
{
    [Required]
    public Guid GoalId { get; set; }
}

/// <summary>
/// Enum for the 3-button check-in system
/// </summary>
public enum CheckInResult
{
    /// <summary>? Yes - User completed their goal today</summary>
    Yes = 1,
    
    /// <summary>? No - User failed to complete their goal today (triggers payment)</summary>
    No = 2,
    
    /// <summary>? Remind Later - User wants to be reminded later (no action)</summary>
    RemindLater = 3
}