using BY.Core.DTOs;
using BY.Core.Entities;
using BY.Core.Enums;
using BY.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace BY.Infrastructure.Services;

public class CheckInService : ICheckInService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<CheckInService> _logger;

    public CheckInService(
        IUnitOfWork unitOfWork,
        IPaymentService paymentService,
        ILogger<CheckInService> logger)
    {
        _unitOfWork = unitOfWork;
        _paymentService = paymentService;
        _logger = logger;
    }

    public async Task<ApiResponse<CheckInResponse>> CreateCheckInAsync(Guid userId, ThreeButtonCheckInRequest request)
    {
        try
        {
            // ADDED: verbose diagnostics
            _logger.LogDebug("[CreateCheckIn] START user={UserId} goal={GoalId} result={Result} rawDate={RawDate}", userId, request.GoalId, request.Result, request.Date);
            // Validate the goal belongs to the user
            var goal = await _unitOfWork.Goals.GetByIdAsync(request.GoalId);
            if (goal == null)
            {
                _logger.LogWarning("[CreateCheckIn] Goal not found goal={GoalId} user={UserId}", request.GoalId, userId);
                return ApiResponse<CheckInResponse>.FailureResult("Goal not found");
            }

            if (goal.UserId != userId)
            {
                _logger.LogWarning("[CreateCheckIn] Goal ownership mismatch goal={GoalId} owner={OwnerId} user={UserId}", request.GoalId, goal.UserId, userId);
                return ApiResponse<CheckInResponse>.FailureResult("Goal does not belong to the current user");
            }

            // Check if goal is active
            if (goal.Status != GoalStatus.Active)
            {
                _logger.LogWarning("[CreateCheckIn] Inactive goal status={Status} goal={GoalId}", goal.Status, goal.Id);
                return ApiResponse<CheckInResponse>.FailureResult("Cannot check-in to an inactive goal");
            }

            // Use provided date or default to today
            var checkInDate = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow);
            _logger.LogDebug("[CreateCheckIn] Resolved date={Date}", checkInDate);

            // Check if check-in already exists for this date
            CheckIn? existingCheckIn = null;
            try
            {
                existingCheckIn = await _unitOfWork.CheckIns.GetTodayCheckInAsync(request.GoalId, checkInDate);
            }
            catch (Exception repoLookupEx)
            {
                _logger.LogError(repoLookupEx, "[CreateCheckIn] Repository lookup failed goal={GoalId} date={Date}", request.GoalId, checkInDate);
                return ApiResponse<CheckInResponse>.FailureResult($"Lookup failure: {repoLookupEx.Message}");
            }
            if (existingCheckIn != null)
            {
                _logger.LogInformation("[CreateCheckIn] Duplicate prevented goal={GoalId} date={Date}", request.GoalId, checkInDate);
                return ApiResponse<CheckInResponse>.FailureResult("Check-in already exists for this date");
            }

            // Handle "Remind Later" case - no actual check-in created
            if (request.Result == CheckInResult.RemindLater)
            {
                _logger.LogInformation("[CreateCheckIn] RemindLater user={UserId} goal={GoalId}", userId, request.GoalId);
                return ApiResponse<CheckInResponse>.SuccessResult(null!, "Reminder scheduled successfully");
            }

            // Create the check-in with explicit UTC DateTime
            var utcNow = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
            var checkIn = new CheckIn
            {
                GoalId = request.GoalId,
                Date = checkInDate,
                Completed = request.Result == CheckInResult.Yes,
                Notes = request.Notes?.Trim(),
                CheckInTime = utcNow, // Ensure UTC kind is specified
                PaymentProcessed = false,
                StreakCount = 0 // Will be calculated
            };

            // Calculate streak
            try
            {
                await UpdateStreakCountAsync(checkIn);
            }
            catch (Exception streakEx)
            {
                _logger.LogError(streakEx, "[CreateCheckIn] Streak calc failed goal={GoalId}", request.GoalId);
            }

            // Add check-in to database
            try
            {
                await _unitOfWork.CheckIns.AddAsync(checkIn);
            }
            catch (Exception addEx)
            {
                _logger.LogError(addEx, "[CreateCheckIn] Add failed goal={GoalId}", request.GoalId);
                return ApiResponse<CheckInResponse>.FailureResult($"Add failure: {addEx.Message}");
            }

            // Process payment if user failed (said "No")
            if (request.Result == CheckInResult.No && goal.DailyStakeAmount > 0)
            {
                try
                {
                    var paymentResult = await _paymentService.ProcessFailurePaymentAsync(userId, checkIn.Id, goal.DailyStakeAmount);
                    if (paymentResult.Success)
                    {
                        checkIn.PaymentProcessed = true;
                        checkIn.AmountCharged = goal.DailyStakeAmount;
                        _logger.LogInformation("[CreateCheckIn] Failure payment processed amount={Amount} goal={GoalId}", goal.DailyStakeAmount, goal.Id);
                    }
                    else
                    {
                        _logger.LogWarning("[CreateCheckIn] Failure payment attempt failed reason={Reason}", paymentResult.Message);
                    }
                }
                catch (Exception payEx)
                {
                    _logger.LogError(payEx, "[CreateCheckIn] Payment exception goal={GoalId}", goal.Id);
                }
            }

            try
            {
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception saveEx)
            {
                _logger.LogError(saveEx, "[CreateCheckIn] SaveChanges failed goal={GoalId}", goal.Id);
                return ApiResponse<CheckInResponse>.FailureResult($"Save failure: {saveEx.Message}");
            }

            var response = MapToCheckInResponse(checkIn, goal);
            _logger.LogInformation("[CreateCheckIn] SUCCESS user={UserId} goal={GoalId} result={Result}", userId, request.GoalId, request.Result);
            return ApiResponse<CheckInResponse>.SuccessResult(response, "Check-in created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[CreateCheckIn] Unhandled error user={UserId} goal={GoalId}", userId, request.GoalId);
            return ApiResponse<CheckInResponse>.FailureResult($"Unhandled error: {ex.Message}");
        }
    }

    public async Task<ApiResponse<CheckInResponse>> UpdateCheckInAsync(Guid userId, Guid checkInId, UpdateCheckInRequest request)
    {
        try
        {
            var checkIn = await _unitOfWork.CheckIns.GetByIdAsync(checkInId);
            if (checkIn == null)
            {
                return ApiResponse<CheckInResponse>.FailureResult("Check-in not found");
            }

            // Validate the check-in belongs to the user
            var goal = await _unitOfWork.Goals.GetByIdAsync(checkIn.GoalId);
            if (goal?.UserId != userId)
            {
                return ApiResponse<CheckInResponse>.FailureResult("Check-in does not belong to the current user");
            }

            // Update fields if provided
            if (request.Notes != null)
            {
                checkIn.Notes = request.Notes.Trim();
            }

            // Handle result change (this is more complex as it might require payment processing)
            if (request.Result.HasValue)
            {
                var wasCompleted = checkIn.Completed;
                var newCompleted = request.Result.Value == CheckInResult.Yes;

                // If changing from success to failure, process payment
                if (wasCompleted && !newCompleted && goal.DailyStakeAmount > 0 && !checkIn.PaymentProcessed)
                {
                    var paymentResult = await _paymentService.ProcessFailurePaymentAsync(userId, checkIn.Id, goal.DailyStakeAmount);
                    
                    if (paymentResult.Success)
                    {
                        checkIn.PaymentProcessed = true;
                        checkIn.AmountCharged = goal.DailyStakeAmount;
                    }
                }

                checkIn.Completed = newCompleted;
                
                // Recalculate streak
                await UpdateStreakCountAsync(checkIn);
            }

            await _unitOfWork.CheckIns.UpdateAsync(checkIn);
            await _unitOfWork.SaveChangesAsync();

            var response = MapToCheckInResponse(checkIn, goal);
            
            _logger.LogInformation("Updated check-in {CheckInId} for user {UserId}", checkInId, userId);

            return ApiResponse<CheckInResponse>.SuccessResult(response, "Check-in updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating check-in {CheckInId} for user {UserId}", checkInId, userId);
            return ApiResponse<CheckInResponse>.FailureResult("An error occurred while updating the check-in");
        }
    }

    public async Task<ApiResponse<bool>> DeleteCheckInAsync(Guid userId, Guid checkInId)
    {
        try
        {
            var checkIn = await _unitOfWork.CheckIns.GetByIdAsync(checkInId);
            if (checkIn == null)
            {
                return ApiResponse<bool>.FailureResult("Check-in not found");
            }

            // Validate the check-in belongs to the user
            var goal = await _unitOfWork.Goals.GetByIdAsync(checkIn.GoalId);
            if (goal?.UserId != userId)
            {
                return ApiResponse<bool>.FailureResult("Check-in does not belong to the current user");
            }

            await _unitOfWork.CheckIns.DeleteAsync(checkIn);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Deleted check-in {CheckInId} for user {UserId}", checkInId, userId);

            return ApiResponse<bool>.SuccessResult(true, "Check-in deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting check-in {CheckInId} for user {UserId}", checkInId, userId);
            return ApiResponse<bool>.FailureResult("An error occurred while deleting the check-in");
        }
    }

    public async Task<ApiResponse<CheckInResponse?>> GetTodayCheckInAsync(Guid userId, Guid goalId)
    {
        try
        {
            // Validate the goal belongs to the user
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<CheckInResponse?>.FailureResult("Goal not found");
            }

            if (goal.UserId != userId)
            {
                return ApiResponse<CheckInResponse?>.FailureResult("Goal does not belong to the current user");
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var checkIn = await _unitOfWork.CheckIns.GetTodayCheckInAsync(goalId, today);

            var response = checkIn != null ? MapToCheckInResponse(checkIn, goal) : null;

            return ApiResponse<CheckInResponse?>.SuccessResult(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting today's check-in for user {UserId}, goal {GoalId}", userId, goalId);
            return ApiResponse<CheckInResponse?>.FailureResult("An error occurred while retrieving today's check-in");
        }
    }

    public async Task<ApiResponse<PagedResponse<CheckInResponse>>> GetCheckInsAsync(Guid userId, GetCheckInsRequest request)
    {
        try
        {
            // If specific goal requested, validate it belongs to the user
            if (request.GoalId.HasValue)
            {
                var goal = await _unitOfWork.Goals.GetByIdAsync(request.GoalId.Value);
                if (goal?.UserId != userId)
                {
                    return ApiResponse<PagedResponse<CheckInResponse>>.FailureResult("Goal not found or does not belong to the current user");
                }
            }

            // Get user's goals to filter check-ins
            var userGoals = await _unitOfWork.Goals.GetUserGoalsAsync(userId);
            var userGoalIds = userGoals.Select(g => g.Id).ToHashSet();

            if (!userGoalIds.Any())
            {
                return ApiResponse<PagedResponse<CheckInResponse>>.SuccessResult(new PagedResponse<CheckInResponse>());
            }

            // Build filter expression - ensure DateTime filtering uses UTC
            var checkIns = await _unitOfWork.CheckIns.GetWhereAsync(c => 
                userGoalIds.Contains(c.GoalId) &&
                (!request.GoalId.HasValue || c.GoalId == request.GoalId.Value) &&
                (!request.Completed.HasValue || c.Completed == request.Completed.Value) &&
                (!request.PaymentProcessed.HasValue || c.PaymentProcessed == request.PaymentProcessed.Value) &&
                (!request.FromDate.HasValue || c.CheckInTime >= DateTime.SpecifyKind(request.FromDate.Value, DateTimeKind.Utc)) &&
                (!request.ToDate.HasValue || c.CheckInTime <= DateTime.SpecifyKind(request.ToDate.Value, DateTimeKind.Utc)));

            var orderedCheckIns = checkIns.OrderByDescending(c => c.CheckInTime).ToList();

            // Apply pagination
            var totalCount = orderedCheckIns.Count;
            var pagedCheckIns = orderedCheckIns
                .Skip(request.Skip)
                .Take(request.Limit)
                .ToList();

            // Map to response DTOs
            var goalLookup = userGoals.ToDictionary(g => g.Id);
            var responseDTOs = pagedCheckIns.Select(c => MapToCheckInResponse(c, goalLookup.GetValueOrDefault(c.GoalId))).ToList();

            var pagedResponse = new PagedResponse<CheckInResponse>
            {
                Items = responseDTOs,
                Total = totalCount,
                Page = request.Page,
                Limit = request.Limit
            };

            return ApiResponse<PagedResponse<CheckInResponse>>.SuccessResult(pagedResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting check-ins for user {UserId}", userId);
            return ApiResponse<PagedResponse<CheckInResponse>>.FailureResult("An error occurred while retrieving check-ins");
        }
    }

    public async Task<ApiResponse<CheckInStatsResponse>> GetCheckInStatsAsync(Guid userId, Guid goalId)
    {
        try
        {
            // Validate the goal belongs to the user
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<CheckInStatsResponse>.FailureResult("Goal not found");
            }

            if (goal.UserId != userId)
            {
                return ApiResponse<CheckInStatsResponse>.FailureResult("Goal does not belong to the current user");
            }

            var checkIns = await _unitOfWork.CheckIns.GetGoalCheckInsAsync(goalId);
            var checkInsList = checkIns.OrderBy(c => c.Date).ToList();

            var totalCheckIns = checkInsList.Count;
            var completedCheckIns = checkInsList.Count(c => c.Completed);
            var failedCheckIns = totalCheckIns - completedCheckIns;
            var completionRate = totalCheckIns > 0 ? (double)completedCheckIns / totalCheckIns * 100 : 0;

            // Calculate current streak and longest streak
            var (currentStreak, longestStreak) = CalculateStreaks(checkInsList);

            // Get total amount charged
            var totalAmountCharged = checkInsList.Where(c => c.AmountCharged.HasValue).Sum(c => c.AmountCharged.Value);

            // Get today's check-in
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var todayCheckIn = checkInsList.FirstOrDefault(c => c.Date == today);

            // Get last check-in
            var lastCheckIn = checkInsList.LastOrDefault();

            var stats = new CheckInStatsResponse
            {
                GoalId = goalId,
                GoalTitle = goal.Title,
                TotalCheckIns = totalCheckIns,
                CompletedCheckIns = completedCheckIns,
                FailedCheckIns = failedCheckIns,
                CompletionRate = Math.Round(completionRate, 2),
                CurrentStreak = currentStreak,
                LongestStreak = longestStreak,
                TotalAmountCharged = totalAmountCharged,
                LastCheckIn = lastCheckIn != null ? MapToCheckInResponse(lastCheckIn, goal) : null,
                TodayCheckIn = todayCheckIn != null ? MapToCheckInResponse(todayCheckIn, goal) : null
            };

            return ApiResponse<CheckInStatsResponse>.SuccessResult(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting check-in stats for user {UserId}, goal {GoalId}", userId, goalId);
            return ApiResponse<CheckInStatsResponse>.FailureResult("An error occurred while retrieving check-in statistics");
        }
    }

    public async Task<ApiResponse<bool>> ProcessRemindLaterAsync(Guid userId, Guid goalId)
    {
        try
        {
            // Validate the goal belongs to the user
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            if (goal == null)
            {
                return ApiResponse<bool>.FailureResult("Goal not found");
            }

            if (goal.UserId != userId)
            {
                return ApiResponse<bool>.FailureResult("Goal does not belong to the current user");
            }

            // TODO: Implement reminder scheduling logic here
            // For now, just log and return success
            
            _logger.LogInformation("Remind later requested for user {UserId}, goal {GoalId}", userId, goalId);

            return ApiResponse<bool>.SuccessResult(true, "Reminder scheduled successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing remind later for user {UserId}, goal {GoalId}", userId, goalId);
            return ApiResponse<bool>.FailureResult("An error occurred while scheduling the reminder");
        }
    }

    private async Task UpdateStreakCountAsync(CheckIn checkIn)
    {
        try
        {
            if (!checkIn.Completed)
            {
                checkIn.StreakCount = 0;
                return;
            }

            // Get previous check-ins for this goal, ordered by date
            var previousCheckIns = await _unitOfWork.CheckIns.GetWhereAsync(c => 
                c.GoalId == checkIn.GoalId && 
                c.Date < checkIn.Date);

            var orderedPreviousCheckIns = previousCheckIns.OrderByDescending(c => c.Date).ToList();

            int streak = 1; // Current check-in counts as 1
            var currentDate = checkIn.Date.AddDays(-1);

            // Count consecutive completed days backwards
            foreach (var previousCheckIn in orderedPreviousCheckIns)
            {
                if (previousCheckIn.Date == currentDate && previousCheckIn.Completed)
                {
                    streak++;
                    currentDate = currentDate.AddDays(-1);
                }
                else if (previousCheckIn.Date == currentDate && !previousCheckIn.Completed)
                {
                    // Hit a failed day, streak breaks
                    break;
                }
                // Skip gaps in dates (days without check-ins don't break streaks)
            }

            checkIn.StreakCount = streak;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating streak count for check-in");
            checkIn.StreakCount = checkIn.Completed ? 1 : 0;
        }
    }

    private static (int currentStreak, int longestStreak) CalculateStreaks(List<CheckIn> checkIns)
    {
        if (!checkIns.Any())
            return (0, 0);

        var orderedCheckIns = checkIns.OrderByDescending(c => c.Date).ToList();
        
        // Calculate current streak (from most recent date backwards)
        int currentStreak = 0;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var checkDate = today;

        // Start from today and work backwards
        for (int i = 0; i < orderedCheckIns.Count; i++)
        {
            var checkIn = orderedCheckIns.FirstOrDefault(c => c.Date == checkDate);
            
            if (checkIn?.Completed == true)
            {
                currentStreak++;
                checkDate = checkDate.AddDays(-1);
            }
            else if (checkIn?.Completed == false)
            {
                // Hit a failed day, streak breaks
                break;
            }
            else
            {
                // No check-in for this day
                if (currentStreak > 0)
                {
                    // If we already have a streak, a missing day breaks it
                    break;
                }
                checkDate = checkDate.AddDays(-1);
            }
        }

        // Calculate longest streak
        int longestStreak = 0;
        int tempStreak = 0;
        
        foreach (var checkIn in checkIns.OrderBy(c => c.Date))
        {
            if (checkIn.Completed)
            {
                tempStreak++;
                longestStreak = Math.Max(longestStreak, tempStreak);
            }
            else
            {
                tempStreak = 0;
            }
        }

        return (currentStreak, longestStreak);
    }

    private static CheckInResponse MapToCheckInResponse(CheckIn checkIn, Goal? goal)
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
            Message = GetCheckInMessage(checkIn)
        };
    }

    private static string GetCheckInMessage(CheckIn checkIn)
    {
        if (checkIn.Completed)
        {
            return checkIn.StreakCount > 1 
                ? $"Great job! You're on a {checkIn.StreakCount}-day streak!" 
                : "Great job! Keep up the momentum!";
        }
        else
        {
            return checkIn.PaymentProcessed 
                ? "Payment processed. Tomorrow is a fresh start!" 
                : "Don't worry - tomorrow is a fresh start!";
        }
    }
}