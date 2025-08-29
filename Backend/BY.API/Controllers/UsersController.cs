using BY.Core.DTOs;
using BY.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BY.API.Controllers;

[Route("api/v1/[controller]")]
public class UsersController : BaseController
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUnitOfWork unitOfWork, ILogger<UsersController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUserProfile()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<UserResponse>.FailureResult("Invalid user"));
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
            if (user == null)
            {
                return NotFound(ApiResponse<UserResponse>.FailureResult("User not found"));
            }

            // Get user statistics
            var totalGoals = await _unitOfWork.Goals.CountAsync(g => g.UserId == userId.Value);
            var activeGoals = await _unitOfWork.Goals.CountAsync(g => g.UserId == userId.Value && g.Status == Core.Enums.GoalStatus.Active);
            var completedGoals = await _unitOfWork.Goals.CountAsync(g => g.UserId == userId.Value && g.Status == Core.Enums.GoalStatus.Completed);
            var totalStaked = await _unitOfWork.Goals
                .GetWhereAsync(g => g.UserId == userId.Value)
                .ContinueWith(goals => goals.Result.Sum(g => g.TotalStakeAmount));
            var totalPaid = await _unitOfWork.Payments.GetUserTotalPaidAsync(userId.Value);

            var userResponse = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                ProfileImageUrl = user.ProfileImageUrl,
                Role = user.Role,
                DefaultReminderTime = user.DefaultReminderTime,
                PreferredCategories = user.PreferredCategories,
                DefaultStakeAmount = user.DefaultStakeAmount,
                TotalGoals = totalGoals,
                ActiveGoals = activeGoals,
                CompletedGoals = completedGoals,
                TotalStaked = totalStaked,
                TotalPaid = totalPaid,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };

            return Ok(ApiResponse<UserResponse>.SuccessResult(userResponse));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user profile");
            return InternalServerError<UserResponse>();
        }
    }

    /// <summary>
    /// Update current user profile
    /// </summary>
    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateCurrentUserProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<UserResponse>.FailureResult("Invalid user"));
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
            if (user == null)
            {
                return NotFound(ApiResponse<UserResponse>.FailureResult("User not found"));
            }

            // Update user properties
            if (!string.IsNullOrWhiteSpace(request.FirstName))
                user.FirstName = request.FirstName;

            if (!string.IsNullOrWhiteSpace(request.LastName))
                user.LastName = request.LastName;

            if (!string.IsNullOrWhiteSpace(request.ProfileImageUrl))
                user.ProfileImageUrl = request.ProfileImageUrl;

            if (request.DefaultReminderTime.HasValue)
                user.DefaultReminderTime = request.DefaultReminderTime.Value;

            if (request.PreferredCategories != null)
                user.PreferredCategories = request.PreferredCategories;

            if (request.DefaultStakeAmount.HasValue)
                user.DefaultStakeAmount = request.DefaultStakeAmount.Value;

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            var userResponse = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                ProfileImageUrl = user.ProfileImageUrl,
                Role = user.Role,
                DefaultReminderTime = user.DefaultReminderTime,
                PreferredCategories = user.PreferredCategories,
                DefaultStakeAmount = user.DefaultStakeAmount,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };

            return Ok(ApiResponse<UserResponse>.SuccessResult(userResponse, "Profile updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            return InternalServerError<UserResponse>();
        }
    }

    /// <summary>
    /// Get user statistics
    /// </summary>
    [HttpGet("me/stats")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUserStats()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<UserStatsResponse>.FailureResult("Invalid user"));
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
            if (user == null)
            {
                return NotFound(ApiResponse<UserStatsResponse>.FailureResult("User not found"));
            }

            var goals = await _unitOfWork.Goals.GetUserGoalsAsync(userId.Value);
            var totalGoals = goals.Count();
            var activeGoals = goals.Count(g => g.Status == Core.Enums.GoalStatus.Active);
            var completedGoals = goals.Count(g => g.Status == Core.Enums.GoalStatus.Completed);
            var failedGoals = goals.Count(g => g.Status == Core.Enums.GoalStatus.Failed);

            var totalStaked = goals.Sum(g => g.TotalStakeAmount);
            var totalPaid = goals.Sum(g => g.TotalPaid);
            var successRate = totalGoals > 0 ? (decimal)completedGoals / totalGoals * 100 : 0;

            var currentLongestStreak = goals.Any() ? goals.Max(g => g.CurrentStreak) : 0;
            var allTimeLongestStreak = goals.Any() ? goals.Max(g => g.LongestStreak) : 0;

            var favoriteCategory = goals
                .GroupBy(g => g.Category)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()?.Key ?? Core.Enums.GoalCategory.Other;

            var stats = new UserStatsResponse
            {
                UserId = userId.Value,
                TotalGoals = totalGoals,
                ActiveGoals = activeGoals,
                CompletedGoals = completedGoals,
                FailedGoals = failedGoals,
                OverallSuccessRate = successRate,
                TotalStaked = totalStaked,
                TotalPaid = totalPaid,
                TotalRefunded = 0, // TODO: Calculate refunds when implemented
                CurrentLongestStreak = currentLongestStreak,
                AllTimeLongestStreak = allTimeLongestStreak,
                FavoriteCategory = favoriteCategory,
                MonthlyStats = new List<MonthlyStatsResponse>() // TODO: Implement monthly stats
            };

            return Ok(ApiResponse<UserStatsResponse>.SuccessResult(stats));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user statistics");
            return InternalServerError<UserStatsResponse>();
        }
    }

    /// <summary>
    /// Delete current user account
    /// </summary>
    [HttpDelete("me")]
    [Authorize]
    public async Task<IActionResult> DeleteCurrentUser()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("Invalid user"));
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
            if (user == null)
            {
                return NotFound(ApiResponse<bool>.FailureResult("User not found"));
            }

            // TODO: Implement proper user deletion (consider soft delete and data retention policies)
            // For now, just deactivate the user
            user.IsActive = false;
            await _unitOfWork.Users.UpdateAsync(user);

            // Revoke all refresh tokens
            await _unitOfWork.RefreshTokens.RevokeAllUserTokensAsync(userId.Value);
            await _unitOfWork.SaveChangesAsync();

            return Ok(ApiResponse<bool>.SuccessResult(true, "Account deactivated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user account");
            return InternalServerError<bool>();
        }
    }
}