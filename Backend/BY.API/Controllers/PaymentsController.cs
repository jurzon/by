using BY.Core.DTOs;
using BY.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BY.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class PaymentsController : BaseController
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// Get payment history for the current user
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="limit">Items per page (default: 20, max: 100)</param>
    /// <returns>Paginated list of payments</returns>
    [HttpGet("history")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<PaymentResponse>>), 200)]
    public async Task<IActionResult> GetPaymentHistory(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<PagedResponse<PaymentResponse>>.FailureResult("Invalid user"));
            }

            // Validate pagination parameters
            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 20;

            var request = new PagedRequest
            {
                Page = page,
                Limit = limit
            };

            var result = await _paymentService.GetPaymentHistoryAsync(userId.Value, request);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPaymentHistory endpoint");
            return InternalServerError<PagedResponse<PaymentResponse>>();
        }
    }

    /// <summary>
    /// Process a stake payment for a goal
    /// </summary>
    /// <param name="request">Stake payment request</param>
    /// <returns>Payment processing result</returns>
    [HttpPost("stake")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
    public async Task<IActionResult> ProcessStakePayment([FromBody] ProcessStakePaymentRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("Invalid user"));
            }

            var result = await _paymentService.ProcessStakePaymentAsync(userId.Value, request.GoalId, request.Amount);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ProcessStakePayment endpoint");
            return InternalServerError<bool>();
        }
    }

    /// <summary>
    /// Request a refund for a stake payment
    /// </summary>
    /// <param name="goalId">Goal ID to refund stake for</param>
    /// <returns>Refund processing result</returns>
    [HttpPost("refund/{goalId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
    public async Task<IActionResult> RefundStake(Guid goalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("Invalid user"));
            }

            var result = await _paymentService.RefundStakeAsync(userId.Value, goalId);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in RefundStake endpoint for goal {GoalId}", goalId);
            return InternalServerError<bool>();
        }
    }
}

/// <summary>
/// Request DTO for processing stake payments
/// </summary>
public class ProcessStakePaymentRequest
{
    public Guid GoalId { get; set; }
    public decimal Amount { get; set; }
}