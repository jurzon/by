using BY.Core.DTOs;
using BY.Core.Enums;
using BY.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BY.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class GoalsController : BaseController
{
    private readonly IGoalService _goalService;
    private readonly ILogger<GoalsController> _logger;

    public GoalsController(IGoalService goalService, ILogger<GoalsController> logger)
    {
        _goalService = goalService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new goal
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateGoal([FromBody] CreateGoalRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<GoalResponse>.FailureResult("Invalid user"));
            }

            var result = await _goalService.CreateGoalAsync(userId.Value, request);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CreateGoal endpoint");
            return InternalServerError<GoalResponse>();
        }
    }

    /// <summary>
    /// Get all goals for the current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUserGoals(
        [FromQuery] GoalStatus? status = null,
        [FromQuery] GoalCategory? category = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<IEnumerable<GoalResponse>>.FailureResult("Invalid user"));
            }

            var result = await _goalService.GetUserGoalsAsync(userId.Value, status, category);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetUserGoals endpoint");
            return InternalServerError<IEnumerable<GoalResponse>>();
        }
    }

    /// <summary>
    /// Get active goals for the current user
    /// </summary>
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveGoals()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<IEnumerable<GoalResponse>>.FailureResult("Invalid user"));
            }

            var result = await _goalService.GetActiveGoalsAsync(userId.Value);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetActiveGoals endpoint");
            return InternalServerError<IEnumerable<GoalResponse>>();
        }
    }

    /// <summary>
    /// Get a specific goal by ID
    /// </summary>
    [HttpGet("{goalId:guid}")]
    public async Task<IActionResult> GetGoal(Guid goalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<GoalResponse>.FailureResult("Invalid user"));
            }

            var result = await _goalService.GetGoalByIdAsync(goalId, userId.Value);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetGoal endpoint for goal {GoalId}", goalId);
            return InternalServerError<GoalResponse>();
        }
    }

    /// <summary>
    /// Update a goal
    /// </summary>
    [HttpPut("{goalId:guid}")]
    public async Task<IActionResult> UpdateGoal(Guid goalId, [FromBody] UpdateGoalRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<GoalResponse>.FailureResult("Invalid user"));
            }

            var result = await _goalService.UpdateGoalAsync(goalId, userId.Value, request);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UpdateGoal endpoint for goal {GoalId}", goalId);
            return InternalServerError<GoalResponse>();
        }
    }

    /// <summary>
    /// Delete a goal
    /// </summary>
    [HttpDelete("{goalId:guid}")]
    public async Task<IActionResult> DeleteGoal(Guid goalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("Invalid user"));
            }

            var result = await _goalService.DeleteGoalAsync(goalId, userId.Value);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in DeleteGoal endpoint for goal {GoalId}", goalId);
            return InternalServerError<bool>();
        }
    }

    /// <summary>
    /// Pause an active goal
    /// </summary>
    [HttpPost("{goalId:guid}/pause")]
    public async Task<IActionResult> PauseGoal(Guid goalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<GoalResponse>.FailureResult("Invalid user"));
            }

            var result = await _goalService.PauseGoalAsync(goalId, userId.Value);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in PauseGoal endpoint for goal {GoalId}", goalId);
            return InternalServerError<GoalResponse>();
        }
    }

    /// <summary>
    /// Resume a paused goal
    /// </summary>
    [HttpPost("{goalId:guid}/resume")]
    public async Task<IActionResult> ResumeGoal(Guid goalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<GoalResponse>.FailureResult("Invalid user"));
            }

            var result = await _goalService.ResumeGoalAsync(goalId, userId.Value);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ResumeGoal endpoint for goal {GoalId}", goalId);
            return InternalServerError<GoalResponse>();
        }
    }

    /// <summary>
    /// Check in for a goal (3-button system)
    /// </summary>
    [HttpPost("{goalId:guid}/checkin")]
    public async Task<IActionResult> CheckIn(Guid goalId, [FromBody] CheckInRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<CheckInResponse>.FailureResult("Invalid user"));
            }

            var result = await _goalService.CheckInAsync(goalId, userId.Value, request);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CheckIn endpoint for goal {GoalId}", goalId);
            return InternalServerError<CheckInResponse>();
        }
    }

    /// <summary>
    /// Get check-in history for a goal
    /// </summary>
    [HttpGet("{goalId:guid}/checkins")]
    public async Task<IActionResult> GetGoalCheckIns(
        Guid goalId,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 30)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<IEnumerable<CheckInResponse>>.FailureResult("Invalid user"));
            }

            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 30;

            var result = await _goalService.GetGoalCheckInsAsync(goalId, userId.Value, page, limit);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetGoalCheckIns endpoint for goal {GoalId}", goalId);
            return InternalServerError<IEnumerable<CheckInResponse>>();
        }
    }
}