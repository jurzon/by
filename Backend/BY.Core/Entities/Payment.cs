using BY.Core.Enums;

namespace BY.Core.Entities;

public class Payment : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid? GoalId { get; set; }
    public Guid? CheckInId { get; set; }
    
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    
    // External payment provider details
    public string? ExternalTransactionId { get; set; }
    public string? PaymentMethodId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    
    // Processing details
    public DateTime? ProcessedAt { get; set; }
    public string? FailureReason { get; set; }
    public string? Notes { get; set; }
    
    // Charity information (for failed stakes)
    public string? CharityName { get; set; }
    public string? CharityId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Goal? Goal { get; set; }
    public virtual CheckIn? CheckIn { get; set; }
}