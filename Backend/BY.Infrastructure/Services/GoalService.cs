using BY.Core.DTOs;
using BY.Core.Entities;
using BY.Core.Enums;
using BY.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace BY.Infrastructure.Services;

public class GoalService : IGoalService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GoalService> _logger;

    public GoalService(IUnitOfWork unitOfWork, ILogger<GoalService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<GoalResponse>> CreateGoalAsync(Guid userId, CreateGoalRequest request)
    {
        try
        {
            // Validate input
            var validationErrors = ValidateCreateGoalRequest(request);
            if (validationErrors.Any())
            {
                return ApiResponse<GoalResponse>.FailureResult("Validation failed", validationErrors);
            }

            // Check if user exists
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<GoalResponse>.FailureResult("User not found");
            }

            // Set start date to today if not provided
            var startDate = request.StartDate ?? DateTime.UtcNow.Date;
            var endDate = startDate.AddDays(request.DurationDays - 1);

            // Calculate daily stake amount
            var dailyStakeAmount = Math.Round(request.TotalStakeAmount / request.DurationDays, 2);

            // Create new goal
            var goal = new Goal
            {
                UserId = userId,
                Title = request.Title.Trim(),
                Description = request.Description?.Trim() ?? string.Empty,
                Category = request.Category,
                Status = GoalStatus.Active,
                StartDate = startDate,
                EndDate = endDate,
                DurationDays = request.DurationDays,
                TotalStakeAmount = request.TotalStakeAmount,
                DailyStakeAmount = dailyStakeAmount,
                ReminderTime = request.ReminderTime,
                ReminderMessage = request.ReminderMessage?.Trim() ?? $"Time to work on: {request.Title}",
                CurrentStreak = 0,
                LongestStreak = 0,
                SuccessfulDays = 0,
                FailedDays = 0,
                MissedDays = 0,
                TotalPaid = 0
            };

            await _unitOfWork.Goals.AddAsync(goal);
            await _unitOfWork.SaveChangesAsync();

            var goalResponse = MapToGoalResponse(goal);

            _logger.LogInformation("Goal created successfully: {GoalId} for user {UserId}", goal.Id, userId);
            return ApiResponse<GoalResponse>.SuccessResult(goalResponse, "Goal created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating goal for user {UserId}", userId);
            return ApiResponse<GoalResponse>.FailureResult("An error occurred while creating the goal");
        }
    }

    public async Task<ApiResponse<GoalResponse>> GetGoalByIdAsync(Guid goalId, Guid userId)
    {
        try
        {
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<GoalResponse>.FailureResult("Goal not found");
            }

            // Check if user owns this goal
            if (goal.UserId != userId)
            {
                return ApiResponse<GoalResponse>.FailureResult("Access denied");
            }

            var goalResponse = MapToGoalResponse(goal);
            return ApiResponse<GoalResponse>.SuccessResult(goalResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving goal {GoalId} for user {UserId}", goalId, userId);
            return ApiResponse<GoalResponse>.FailureResult("An error occurred while retrieving the goal");
        }
    }

    public async Task<ApiResponse<IEnumerable<GoalResponse>>> GetUserGoalsAsync(Guid userId, GoalStatus? status = null, GoalCategory? category = null)
    {
        try
        {
            var goals = await _unitOfWork.Goals.GetUserGoalsAsync(userId);

            // Apply filters
            if (status.HasValue)
            {
                goals = goals.Where(g => g.Status == status.Value);
            }

            if (category.HasValue)
            {
                goals = goals.Where(g => g.Category == category.Value);
            }

            var goalResponses = goals.Select(MapToGoalResponse).ToList();
            return ApiResponse<IEnumerable<GoalResponse>>.SuccessResult(goalResponses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving goals for user {UserId}", userId);
            return ApiResponse<IEnumerable<GoalResponse>>.FailureResult("An error occurred while retrieving goals");
        }
    }

    public async Task<ApiResponse<IEnumerable<GoalResponse>>> GetActiveGoalsAsync(Guid userId)
    {
        try
        {
            var activeGoals = await _unitOfWork.Goals.GetActiveGoalsAsync(userId);
            var goalResponses = activeGoals.Select(MapToGoalResponse).ToList();
            return ApiResponse<IEnumerable<GoalResponse>>.SuccessResult(goalResponses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active goals for user {UserId}", userId);
            return ApiResponse<IEnumerable<GoalResponse>>.FailureResult("An error occurred while retrieving active goals");
        }
    }

    public async Task<ApiResponse<GoalResponse>> UpdateGoalAsync(Guid goalId, Guid userId, UpdateGoalRequest request)
    {
        try
        {
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<GoalResponse>.FailureResult("Goal not found");
            }

            // Check if user owns this goal
            if (goal.UserId != userId)
            {
                return ApiResponse<GoalResponse>.FailureResult("Access denied");
            }

            // Check if goal is active (can't update completed or failed goals)
            if (goal.Status != GoalStatus.Active && goal.Status != GoalStatus.Paused)
            {
                return ApiResponse<GoalResponse>.FailureResult("Cannot update completed or failed goals");
            }

            // Update allowed properties
            if (!string.IsNullOrWhiteSpace(request.Title))
                goal.Title = request.Title.Trim();

            if (request.Description != null)
                goal.Description = request.Description.Trim();

            if (request.ReminderTime.HasValue)
                goal.ReminderTime = request.ReminderTime.Value;

            if (!string.IsNullOrWhiteSpace(request.ReminderMessage))
                goal.ReminderMessage = request.ReminderMessage.Trim();

            await _unitOfWork.Goals.UpdateAsync(goal);
            await _unitOfWork.SaveChangesAsync();

            var goalResponse = MapToGoalResponse(goal);

            _logger.LogInformation("Goal updated successfully: {GoalId} for user {UserId}", goalId, userId);
            return ApiResponse<GoalResponse>.SuccessResult(goalResponse, "Goal updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating goal {GoalId} for user {UserId}", goalId, userId);
            return ApiResponse<GoalResponse>.FailureResult("An error occurred while updating the goal");
        }
    }

    public async Task<ApiResponse<bool>> DeleteGoalAsync(Guid goalId, Guid userId)
    {
        try
        {
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<bool>.FailureResult("Goal not found");
            }

            // Check if user owns this goal
            if (goal.UserId != userId)
            {
                return ApiResponse<bool>.FailureResult("Access denied");
            }

            await _unitOfWork.Goals.DeleteAsync(goal);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Goal deleted successfully: {GoalId} for user {UserId}", goalId, userId);
            return ApiResponse<bool>.SuccessResult(true, "Goal deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting goal {GoalId} for user {UserId}", goalId, userId);
            return ApiResponse<bool>.FailureResult("An error occurred while deleting the goal");
        }
    }

    public async Task<ApiResponse<GoalResponse>> PauseGoalAsync(Guid goalId, Guid userId)
    {
        try
        {
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<GoalResponse>.FailureResult("Goal not found");
            }

            if (goal.UserId != userId)
            {
                return ApiResponse<GoalResponse>.FailureResult("Access denied");
            }

            if (goal.Status != GoalStatus.Active)
            {
                return ApiResponse<GoalResponse>.FailureResult("Only active goals can be paused");
            }

            goal.Status = GoalStatus.Paused;
            await _unitOfWork.Goals.UpdateAsync(goal);
            await _unitOfWork.SaveChangesAsync();

            var goalResponse = MapToGoalResponse(goal);
            return ApiResponse<GoalResponse>.SuccessResult(goalResponse, "Goal paused successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing goal {GoalId} for user {UserId}", goalId, userId);
            return ApiResponse<GoalResponse>.FailureResult("An error occurred while pausing the goal");
        }
    }

    public async Task<ApiResponse<GoalResponse>> ResumeGoalAsync(Guid goalId, Guid userId)
    {
        try
        {
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<GoalResponse>.FailureResult("Goal not found");
            }

            if (goal.UserId != userId)
            {
                return ApiResponse<GoalResponse>.FailureResult("Access denied");
            }

            if (goal.Status != GoalStatus.Paused)
            {
                return ApiResponse<GoalResponse>.FailureResult("Only paused goals can be resumed");
            }

            goal.Status = GoalStatus.Active;
            await _unitOfWork.Goals.UpdateAsync(goal);
            await _unitOfWork.SaveChangesAsync();

            var goalResponse = MapToGoalResponse(goal);
            return ApiResponse<GoalResponse>.SuccessResult(goalResponse, "Goal resumed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming goal {GoalId} for user {UserId}", goalId, userId);
            return ApiResponse<GoalResponse>.FailureResult("An error occurred while resuming the goal");
        }
    }

    public async Task<ApiResponse<CheckInResponse>> CheckInAsync(Guid goalId, Guid userId, CheckInRequest request)
    {
        try
        {
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<CheckInResponse>.FailureResult("Goal not found");
            }

            if (goal.UserId != userId)
            {
                return ApiResponse<CheckInResponse>.FailureResult("Access denied");
            }

            if (goal.Status != GoalStatus.Active)
            {
                return ApiResponse<CheckInResponse>.FailureResult("Goal is not active");
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

            // Check if already checked in today
            var existingCheckIn = await _unitOfWork.CheckIns.GetTodayCheckInAsync(goalId, today);
            if (existingCheckIn != null)
            {
                return ApiResponse<CheckInResponse>.FailureResult("Already checked in for today");
            }

            // Create check-in
            var checkIn = new CheckIn
            {
                GoalId = goalId,
                Date = today,
                Completed = request.Completed,
                Notes = request.Notes?.Trim(),
                CheckInTime = DateTime.UtcNow,
                PaymentProcessed = false,
                AmountCharged = 0,
                StreakCount = 0
            };

            // Update goal statistics
            if (request.Completed)
            {
                goal.SuccessfulDays++;
                goal.CurrentStreak++;
                if (goal.CurrentStreak > goal.LongestStreak)
                {
                    goal.LongestStreak = goal.CurrentStreak;
                }
                checkIn.StreakCount = goal.CurrentStreak;
            }
            else
            {
                goal.FailedDays++;
                goal.CurrentStreak = 0;
                goal.TotalPaid += goal.DailyStakeAmount;
                checkIn.PaymentProcessed = true;
                checkIn.AmountCharged = goal.DailyStakeAmount;
            }

            await _unitOfWork.CheckIns.AddAsync(checkIn);
            await _unitOfWork.Goals.UpdateAsync(goal);
            await _unitOfWork.SaveChangesAsync();

            var checkInResponse = MapToCheckInResponse(checkIn, request.Completed ? 
                "Great job! Keep up the momentum!" : 
                "Don't worry - tomorrow is a fresh start!");

            return ApiResponse<CheckInResponse>.SuccessResult(checkInResponse, "Check-in recorded successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during check-in for goal {GoalId}, user {UserId}", goalId, userId);
            return ApiResponse<CheckInResponse>.FailureResult("An error occurred during check-in");
        }
    }

    public async Task<ApiResponse<IEnumerable<CheckInResponse>>> GetGoalCheckInsAsync(Guid goalId, Guid userId, int page = 1, int limit = 30)
    {
        try
        {
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<IEnumerable<CheckInResponse>>.FailureResult("Goal not found");
            }

            if (goal.UserId != userId)
            {
                return ApiResponse<IEnumerable<CheckInResponse>>.FailureResult("Access denied");
            }

            var checkIns = await _unitOfWork.CheckIns.GetGoalCheckInsAsync(goalId);
            
            var paginatedCheckIns = checkIns
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(c => MapToCheckInResponse(c))
                .ToList();

            return ApiResponse<IEnumerable<CheckInResponse>>.SuccessResult(paginatedCheckIns);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving check-ins for goal {GoalId}, user {UserId}", goalId, userId);
            return ApiResponse<IEnumerable<CheckInResponse>>.FailureResult("An error occurred while retrieving check-ins");
        }
    }

    private List<string> ValidateCreateGoalRequest(CreateGoalRequest request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.Title))
            errors.Add("Title is required");
        else if (request.Title.Length > 200)
            errors.Add("Title must be less than 200 characters");

        if (request.DurationDays < 1)
            errors.Add("Duration must be at least 1 day");
        else if (request.DurationDays > 365)
            errors.Add("Duration cannot exceed 365 days");

        if (request.TotalStakeAmount < 0)
            errors.Add("Stake amount cannot be negative");

        return errors;
    }

    private static GoalResponse MapToGoalResponse(Goal goal)
    {
        var totalDays = goal.SuccessfulDays + goal.FailedDays;
        var progressPercentage = goal.DurationDays > 0 ? (decimal)totalDays / goal.DurationDays * 100 : 0;
        var successRate = totalDays > 0 ? (decimal)goal.SuccessfulDays / totalDays * 100 : 0;

        return new GoalResponse
        {
            Id = goal.Id,
            Title = goal.Title,
            Description = goal.Description,
            Category = goal.Category,
            Status = goal.Status,
            StartDate = goal.StartDate,
            EndDate = goal.EndDate,
            DurationDays = goal.DurationDays,
            TotalStakeAmount = goal.TotalStakeAmount,
            DailyStakeAmount = goal.DailyStakeAmount,
            ReminderTime = goal.ReminderTime,
            SuccessfulDays = goal.SuccessfulDays,
            FailedDays = goal.FailedDays,
            MissedDays = goal.MissedDays,
            CurrentStreak = goal.CurrentStreak,
            LongestStreak = goal.LongestStreak,
            TotalPaid = goal.TotalPaid,
            ProgressPercentage = Math.Round(progressPercentage, 1),
            SuccessRate = Math.Round(successRate, 1),
            IsActive = goal.Status == GoalStatus.Active,
            CreatedAt = goal.CreatedAt
        };
    }

    private static CheckInResponse MapToCheckInResponse(CheckIn checkIn, string? message = null)
    {
        return new CheckInResponse
        {
            Id = checkIn.Id,
            GoalId = checkIn.GoalId,
            Date = checkIn.Date,
            Completed = checkIn.Completed,
            Notes = checkIn.Notes,
            CheckInTime = checkIn.CheckInTime,
            PaymentProcessed = checkIn.PaymentProcessed,
            AmountCharged = checkIn.AmountCharged,
            StreakCount = checkIn.StreakCount,
            Message = message
        };
    }
}