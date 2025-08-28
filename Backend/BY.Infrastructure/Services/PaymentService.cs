using BY.Core.DTOs;
using BY.Core.Entities;
using BY.Core.Enums;
using BY.Core.Interfaces;
using BY.Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;

namespace BY.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PaymentService> _logger;
    private readonly StripeSettings _stripeSettings;
    private readonly PaymentIntentService _paymentIntentService;
    private readonly CustomerService _customerService;
    private readonly PaymentMethodService _paymentMethodService;

    public PaymentService(
        IUnitOfWork unitOfWork, 
        ILogger<PaymentService> logger,
        IOptions<StripeSettings> stripeSettings)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _stripeSettings = stripeSettings.Value;
        
        // Configure Stripe
        StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        
        // Initialize Stripe services
        _paymentIntentService = new PaymentIntentService();
        _customerService = new CustomerService();
        _paymentMethodService = new PaymentMethodService();
    }

    public async Task<ApiResponse<bool>> ProcessStakePaymentAsync(Guid userId, Guid goalId, decimal amount)
    {
        try
        {
            _logger.LogInformation("Processing stake payment of {Amount} for user {UserId}, goal {GoalId}", amount, userId, goalId);
            
            // Get user and goal
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            var goal = await _unitOfWork.Goals.GetByIdAsync(goalId);
            
            if (user == null || goal == null)
            {
                return ApiResponse<bool>.FailureResult("User or goal not found");
            }

            // For stake payments, we typically just authorize/hold the funds
            // The actual charge happens when the user fails their commitment
            
            // Create payment record for tracking
            var payment = new Core.Entities.Payment
            {
                UserId = userId,
                GoalId = goalId,
                Type = PaymentType.Stake,
                Status = PaymentStatus.Authorized,
                Amount = amount,
                Currency = _stripeSettings.Currency.ToUpper(),
                Notes = $"Stake authorization for goal: {goal.Title}",
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Payments.AddAsync(payment);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Stake payment authorized successfully for user {UserId}, goal {GoalId}", userId, goalId);
            return ApiResponse<bool>.SuccessResult(true, "Stake payment authorized successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing stake payment for user {UserId}, goal {GoalId}", userId, goalId);
            return ApiResponse<bool>.FailureResult("An error occurred while processing the stake payment");
        }
    }

    public async Task<ApiResponse<bool>> ProcessFailurePaymentAsync(Guid userId, Guid checkInId, decimal amount)
    {
        try
        {
            _logger.LogInformation("Processing failure payment of {Amount} for user {UserId}, check-in {CheckInId}", amount, userId, checkInId);
            
            // Get user and check-in
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            var checkIn = await _unitOfWork.CheckIns.GetByIdAsync(checkInId);
            
            if (user == null || checkIn == null)
            {
                return ApiResponse<bool>.FailureResult("User or check-in not found");
            }

            // Get goal for context
            var goal = await _unitOfWork.Goals.GetByIdAsync(checkIn.GoalId);
            if (goal == null)
            {
                return ApiResponse<bool>.FailureResult("Goal not found");
            }

            // Get or create Stripe customer
            var stripeCustomerId = await GetOrCreateStripeCustomerAsync(user);
            if (string.IsNullOrEmpty(stripeCustomerId))
            {
                return ApiResponse<bool>.FailureResult("Unable to create Stripe customer");
            }

            // Get user's default payment method
            var paymentMethodId = await GetUserDefaultPaymentMethodAsync(stripeCustomerId);
            if (string.IsNullOrEmpty(paymentMethodId))
            {
                return ApiResponse<bool>.FailureResult("No payment method found. Please add a payment method first.");
            }

            try
            {
                // Create payment intent for the failure amount
                var paymentIntentOptions = new PaymentIntentCreateOptions
                {
                    Amount = (long)(amount * 100), // Convert to cents
                    Currency = _stripeSettings.Currency,
                    Customer = stripeCustomerId,
                    PaymentMethod = paymentMethodId,
                    Confirm = true,
                    Description = $"Goal failure payment - {goal.Title}",
                    Metadata = new Dictionary<string, string>
                    {
                        { "user_id", userId.ToString() },
                        { "goal_id", goal.Id.ToString() },
                        { "check_in_id", checkInId.ToString() },
                        { "payment_type", "failure" }
                    }
                };

                var paymentIntent = await _paymentIntentService.CreateAsync(paymentIntentOptions);

                // Create payment record
                var payment = new Core.Entities.Payment
                {
                    UserId = userId,
                    GoalId = goal.Id,
                    CheckInId = checkInId,
                    Type = PaymentType.Failure,
                    Status = MapStripeStatusToPaymentStatus(paymentIntent.Status),
                    Amount = amount,
                    Currency = _stripeSettings.Currency.ToUpper(),
                    ExternalTransactionId = paymentIntent.Id,
                    StripePaymentIntentId = paymentIntent.Id,
                    PaymentMethodId = paymentMethodId,
                    Notes = $"Failure payment for goal: {goal.Title}",
                    CharityName = _stripeSettings.DefaultCharityName,
                    CharityId = _stripeSettings.DefaultCharityId,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Payments.AddAsync(payment);
                
                // Update the check-in with payment information
                checkIn.PaymentId = payment.Id;
                checkIn.PaymentProcessed = paymentIntent.Status == "succeeded";
                checkIn.AmountCharged = amount;
                
                await _unitOfWork.CheckIns.UpdateAsync(checkIn);
                await _unitOfWork.SaveChangesAsync();

                if (paymentIntent.Status == "succeeded")
                {
                    _logger.LogInformation("Failure payment processed successfully: {PaymentIntentId} for user {UserId}", 
                        paymentIntent.Id, userId);
                    return ApiResponse<bool>.SuccessResult(true, "Failure payment processed successfully");
                }
                else
                {
                    _logger.LogWarning("Failure payment requires additional action: {PaymentIntentId} for user {UserId}", 
                        paymentIntent.Id, userId);
                    return ApiResponse<bool>.FailureResult($"Payment requires additional action: {paymentIntent.Status}");
                }
            }
            catch (StripeException stripeEx)
            {
                _logger.LogError(stripeEx, "Stripe error processing failure payment for user {UserId}: {Error}", 
                    userId, stripeEx.Message);
                
                // Create failed payment record
                var failedPayment = new Core.Entities.Payment
                {
                    UserId = userId,
                    GoalId = goal.Id,
                    CheckInId = checkInId,
                    Type = PaymentType.Failure,
                    Status = PaymentStatus.Failed,
                    Amount = amount,
                    Currency = _stripeSettings.Currency.ToUpper(),
                    FailureReason = stripeEx.Message,
                    Notes = $"Failed payment for goal: {goal.Title}",
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Payments.AddAsync(failedPayment);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse<bool>.FailureResult($"Payment failed: {stripeEx.Message}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing failure payment for user {UserId}, check-in {CheckInId}", userId, checkInId);
            return ApiResponse<bool>.FailureResult("An error occurred while processing the failure payment");
        }
    }

    public async Task<ApiResponse<bool>> RefundStakeAsync(Guid userId, Guid goalId)
    {
        try
        {
            _logger.LogInformation("Processing refund for user {UserId}, goal {GoalId}", userId, goalId);
            
            // Find the original stake payment
            var stakePayments = await _unitOfWork.Payments.GetWhereAsync(p => 
                p.UserId == userId && 
                p.GoalId == goalId && 
                p.Type == PaymentType.Stake &&
                p.Status == PaymentStatus.Completed);

            var stakePayment = stakePayments.FirstOrDefault();
            if (stakePayment == null)
            {
                return ApiResponse<bool>.FailureResult("No stake payment found to refund");
            }

            if (string.IsNullOrEmpty(stakePayment.StripePaymentIntentId))
            {
                return ApiResponse<bool>.FailureResult("Cannot refund payment without Stripe payment intent ID");
            }

            try
            {
                // Create refund in Stripe
                var refundService = new RefundService();
                var refundOptions = new RefundCreateOptions
                {
                    PaymentIntent = stakePayment.StripePaymentIntentId,
                    Amount = (long)(stakePayment.Amount * 100), // Convert to cents
                    Reason = RefundReasons.RequestedByCustomer,
                    Metadata = new Dictionary<string, string>
                    {
                        { "user_id", userId.ToString() },
                        { "goal_id", goalId.ToString() },
                        { "refund_type", "stake_refund" }
                    }
                };

                var refund = await refundService.CreateAsync(refundOptions);

                // Create refund payment record
                var refundPayment = new Core.Entities.Payment
                {
                    UserId = userId,
                    GoalId = goalId,
                    Type = PaymentType.Refund,
                    Status = MapStripeRefundStatusToPaymentStatus(refund.Status),
                    Amount = -stakePayment.Amount, // Negative amount for refund
                    Currency = stakePayment.Currency,
                    ExternalTransactionId = refund.Id,
                    Notes = $"Refund for stake payment: {stakePayment.Id}",
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Payments.AddAsync(refundPayment);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Refund processed successfully: {RefundId} for user {UserId}", 
                    refund.Id, userId);
                
                return ApiResponse<bool>.SuccessResult(true, "Refund processed successfully");
            }
            catch (StripeException stripeEx)
            {
                _logger.LogError(stripeEx, "Stripe error processing refund for user {UserId}: {Error}", 
                    userId, stripeEx.Message);
                return ApiResponse<bool>.FailureResult($"Refund failed: {stripeEx.Message}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for user {UserId}, goal {GoalId}", userId, goalId);
            return ApiResponse<bool>.FailureResult("An error occurred while processing the refund");
        }
    }

    public async Task<ApiResponse<PagedResponse<PaymentResponse>>> GetPaymentHistoryAsync(Guid userId, PagedRequest request)
    {
        try
        {
            _logger.LogInformation("Getting payment history for user {UserId}", userId);
            
            var (payments, total) = await _unitOfWork.Payments.GetPagedAsync(
                request.Page,
                request.Limit,
                p => p.UserId == userId
            );

            var paymentResponses = new List<PaymentResponse>();
            
            foreach (var payment in payments.OrderByDescending(p => p.CreatedAt))
            {
                var goal = payment.GoalId.HasValue ? 
                    await _unitOfWork.Goals.GetByIdAsync(payment.GoalId.Value) : null;

                paymentResponses.Add(MapToPaymentResponse(payment, goal?.Title));
            }

            var pagedResponse = new PagedResponse<PaymentResponse>
            {
                Items = paymentResponses,
                Total = total,
                Page = request.Page,
                Limit = request.Limit
            };

            return ApiResponse<PagedResponse<PaymentResponse>>.SuccessResult(pagedResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment history for user {UserId}", userId);
            return ApiResponse<PagedResponse<PaymentResponse>>.FailureResult("An error occurred while retrieving payment history");
        }
    }

    #region Private Helper Methods

    private async Task<string?> GetOrCreateStripeCustomerAsync(User user)
    {
        try
        {
            // For simplicity, we'll store the Stripe customer ID in a user field
            // In a real implementation, you might have a separate UserPaymentProfile table
            
            // Try to find existing customer by email
            var customers = await _customerService.ListAsync(new CustomerListOptions
            {
                Email = user.Email,
                Limit = 1
            });

            if (customers.Data.Any())
            {
                return customers.Data.First().Id;
            }

            // Create new customer
            var customerOptions = new CustomerCreateOptions
            {
                Email = user.Email,
                Name = user.FullName,
                Description = $"Customer for user {user.Id}",
                Metadata = new Dictionary<string, string>
                {
                    { "user_id", user.Id.ToString() }
                }
            };

            var customer = await _customerService.CreateAsync(customerOptions);
            
            _logger.LogInformation("Created Stripe customer {CustomerId} for user {UserId}", 
                customer.Id, user.Id);
            
            return customer.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Stripe customer for user {UserId}", user.Id);
            return null;
        }
    }

    private async Task<string?> GetUserDefaultPaymentMethodAsync(string stripeCustomerId)
    {
        try
        {
            var paymentMethods = await _paymentMethodService.ListAsync(new PaymentMethodListOptions
            {
                Customer = stripeCustomerId,
                Type = "card"
            });

            return paymentMethods.Data.FirstOrDefault()?.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment methods for customer {CustomerId}", stripeCustomerId);
            return null;
        }
    }

    private static PaymentStatus MapStripeStatusToPaymentStatus(string stripeStatus)
    {
        return stripeStatus switch
        {
            "succeeded" => PaymentStatus.Completed,
            "processing" => PaymentStatus.Processing,
            "requires_payment_method" => PaymentStatus.Failed,
            "requires_confirmation" => PaymentStatus.Pending,
            "requires_action" => PaymentStatus.Pending,
            "canceled" => PaymentStatus.Cancelled,
            _ => PaymentStatus.Pending
        };
    }

    private static PaymentStatus MapStripeRefundStatusToPaymentStatus(string refundStatus)
    {
        return refundStatus switch
        {
            "succeeded" => PaymentStatus.Completed,
            "pending" => PaymentStatus.Processing,
            "failed" => PaymentStatus.Failed,
            "canceled" => PaymentStatus.Cancelled,
            _ => PaymentStatus.Pending
        };
    }

    private static PaymentResponse MapToPaymentResponse(Core.Entities.Payment payment, string? goalTitle)
    {
        return new PaymentResponse
        {
            Id = payment.Id,
            GoalId = payment.GoalId,
            GoalTitle = goalTitle,
            Amount = payment.Amount,
            Type = payment.Type,
            Status = payment.Status,
            CreatedAt = payment.CreatedAt,
            ProcessedAt = payment.Status == PaymentStatus.Completed ? payment.UpdatedAt : null,
            Notes = payment.Notes,
            CharityName = payment.CharityName
        };
    }

    #endregion
}