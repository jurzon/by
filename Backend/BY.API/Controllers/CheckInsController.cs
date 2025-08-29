using BY.Core.DTOs;
using BY.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BY.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CheckInsController : BaseController
{
    private readonly ICheckInService _checkInService;
    private readonly ILogger<CheckInsController> _logger;

    public CheckInsController(ICheckInService checkInService, ILogger<CheckInsController> logger)
    {
        _checkInService = checkInService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new check-in using the 3-button system (Yes/No/Remind Later)
    /// </summary>
    /// <param name="request">Check-in request with result (Yes/No/Remind Later)</param>
    /// <returns>Check-in response or reminder confirmation</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 400)]
    public async Task<IActionResult> CreateCheckIn([FromBody] ThreeButtonCheckInRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<CheckInResponse>.FailureResult("Invalid user"));
            }

            var result = await _checkInService.CreateCheckInAsync(userId.Value, request);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CreateCheckIn endpoint");
            return InternalServerError<CheckInResponse>();
        }
    }

    /// <summary>
    /// Get today's check-in for a specific goal
    /// </summary>
    /// <param name="goalId">Goal ID</param>
    /// <returns>Today's check-in if it exists, null otherwise</returns>
    [HttpGet("today/{goalId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 404)]
    public async Task<IActionResult> GetTodayCheckIn(Guid goalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<CheckInResponse?>.FailureResult("Invalid user"));
            }

            var result = await _checkInService.GetTodayCheckInAsync(userId.Value, goalId);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetTodayCheckIn endpoint for goal {GoalId}", goalId);
            return InternalServerError<CheckInResponse>();
        }
    }

    /// <summary>
    /// Get check-ins with optional filtering and pagination
    /// </summary>
    /// <param name="goalId">Filter by specific goal (optional)</param>
    /// <param name="fromDate">Filter from date (optional)</param>
    /// <param name="toDate">Filter to date (optional)</param>
    /// <param name="completed">Filter by completion status (optional)</param>
    /// <param name="paymentProcessed">Filter by payment status (optional)</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="limit">Items per page (default: 30, max: 100)</param>
    /// <returns>Paginated list of check-ins</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<CheckInResponse>>), 200)]
    public async Task<IActionResult> GetCheckIns(
        [FromQuery] Guid? goalId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool? completed = null,
        [FromQuery] bool? paymentProcessed = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 30)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<PagedResponse<CheckInResponse>>.FailureResult("Invalid user"));
            }

            // Validate pagination parameters
            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 30;

            var request = new GetCheckInsRequest
            {
                GoalId = goalId,
                FromDate = fromDate,
                ToDate = toDate,
                Completed = completed,
                PaymentProcessed = paymentProcessed,
                Page = page,
                Limit = limit
            };

            var result = await _checkInService.GetCheckInsAsync(userId.Value, request);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetCheckIns endpoint");
            return InternalServerError<PagedResponse<CheckInResponse>>();
        }
    }

    /// <summary>
    /// Get check-in statistics and progress for a specific goal
    /// </summary>
    /// <param name="goalId">Goal ID</param>
    /// <returns>Check-in statistics including streaks, completion rate, and totals</returns>
    [HttpGet("stats/{goalId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CheckInStatsResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<CheckInStatsResponse>), 404)]
    public async Task<IActionResult> GetCheckInStats(Guid goalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<CheckInStatsResponse>.FailureResult("Invalid user"));
            }

            var result = await _checkInService.GetCheckInStatsAsync(userId.Value, goalId);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetCheckInStats endpoint for goal {GoalId}", goalId);
            return InternalServerError<CheckInStatsResponse>();
        }
    }

    /// <summary>
    /// Update an existing check-in
    /// </summary>
    /// <param name="checkInId">Check-in ID</param>
    /// <param name="request">Update check-in request</param>
    /// <returns>Updated check-in response</returns>
    [HttpPut("{checkInId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 400)]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 404)]
    public async Task<IActionResult> UpdateCheckIn(Guid checkInId, [FromBody] UpdateCheckInRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<CheckInResponse>.FailureResult("Invalid user"));
            }

            var result = await _checkInService.UpdateCheckInAsync(userId.Value, checkInId, request);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UpdateCheckIn endpoint for check-in {CheckInId}", checkInId);
            return InternalServerError<CheckInResponse>();
        }
    }

    /// <summary>
    /// Delete a check-in
    /// </summary>
    /// <param name="checkInId">Check-in ID</param>
    /// <returns>Success confirmation</returns>
    [HttpDelete("{checkInId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 404)]
    public async Task<IActionResult> DeleteCheckIn(Guid checkInId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("Invalid user"));
            }

            var result = await _checkInService.DeleteCheckInAsync(userId.Value, checkInId);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in DeleteCheckIn endpoint for check-in {CheckInId}", checkInId);
            return InternalServerError<bool>();
        }
    }

    /// <summary>
    /// Process "Remind Later" request for a goal (schedules a reminder)
    /// </summary>
    /// <param name="goalId">Goal ID</param>
    /// <returns>Reminder confirmation</returns>
    [HttpPost("remind-later/{goalId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 404)]
    public async Task<IActionResult> RemindLater(Guid goalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("Invalid user"));
            }

            var result = await _checkInService.ProcessRemindLaterAsync(userId.Value, goalId);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in RemindLater endpoint for goal {GoalId}", goalId);
            return InternalServerError<bool>();
        }
    }

    /// <summary>
    /// Quick check-in endpoint for the 3-button system
    /// Simplified endpoint that just takes the goal ID and result in the URL/body
    /// </summary>
    /// <param name="goalId">Goal ID</param>
    /// <param name="result">Check-in result: 1=Yes, 2=No, 3=RemindLater</param>
    /// <param name="notes">Optional notes</param>
    /// <returns>Check-in response or reminder confirmation</returns>
    [HttpPost("quick/{goalId:guid}/{result:int}")]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<CheckInResponse>), 400)]
    public async Task<IActionResult> QuickCheckIn(
        Guid goalId, 
        int result, 
        [FromBody] string? notes = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<CheckInResponse>.FailureResult("Invalid user"));
            }

            // Validate result parameter
            if (!Enum.IsDefined(typeof(CheckInResult), result))
            {
                return BadRequest(ApiResponse<CheckInResponse>.FailureResult("Invalid check-in result. Use 1=Yes, 2=No, 3=RemindLater"));
            }

            var request = new ThreeButtonCheckInRequest
            {
                GoalId = goalId,
                Result = (CheckInResult)result,
                Notes = notes
            };

            var serviceResult = await _checkInService.CreateCheckInAsync(userId.Value, request);
            return HandleServiceResponse(serviceResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in QuickCheckIn endpoint for goal {GoalId}", goalId);
            return InternalServerError<CheckInResponse>();
        }
    }
}