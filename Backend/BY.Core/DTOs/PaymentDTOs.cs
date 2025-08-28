using BY.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace BY.Core.DTOs;

/// <summary>
/// Request DTO for creating a payment
/// </summary>
public class CreatePaymentRequest
{
    [Required]
    public Guid GoalId { get; set; }
    
    public Guid? CheckInId { get; set; }
    
    [Required]
    public PaymentType Type { get; set; }
    
    [Required]
    [Range(0.01, 10000)]
    public decimal Amount { get; set; }
    
    public string Currency { get; set; } = "USD";
    
    public string? PaymentMethodId { get; set; }
    
    public string? Notes { get; set; }
    
    public string? CharityId { get; set; }
}

/// <summary>
/// Request DTO for processing a payment
/// </summary>
public class ProcessPaymentRequest
{
    [Required]
    public string PaymentMethodId { get; set; } = string.Empty;
    
    public bool SavePaymentMethod { get; set; } = false;
}

/// <summary>
/// Response DTO for payment processing
/// </summary>
public class ProcessPaymentResponse
{
    public Guid PaymentId { get; set; }
    public PaymentStatus Status { get; set; }
    public string? ExternalTransactionId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public string? FailureReason { get; set; }
    public bool RequiresAction { get; set; }
    public string? ClientSecret { get; set; }
}

/// <summary>
/// Request DTO for getting payments with filters
/// </summary>
public class GetPaymentsRequest : PagedRequest
{
    public Guid? GoalId { get; set; }
    public PaymentType? Type { get; set; }
    public PaymentStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Response DTO for payment statistics
/// </summary>
public class PaymentStatsResponse
{
    public decimal TotalPaid { get; set; }
    public decimal TotalStaked { get; set; }
    public decimal TotalRefunded { get; set; }
    public int TotalTransactions { get; set; }
    public int SuccessfulTransactions { get; set; }
    public int FailedTransactions { get; set; }
    public decimal AveragePayment { get; set; }
    public DateTime? LastPaymentDate { get; set; }
}