namespace BY.Core.Entities;

public class CheckIn : BaseEntity
{
    public Guid GoalId { get; set; }
    public DateOnly Date { get; set; }
    public bool Completed { get; set; }
    public string? Notes { get; set; }
    public DateTime CheckInTime { get; set; }
    
    // Payment tracking for failures
    public bool PaymentProcessed { get; set; } = false;
    public decimal? AmountCharged { get; set; }
    public Guid? PaymentId { get; set; }
    
    // Streak tracking
    public int StreakCount { get; set; } = 0;
    
    // Navigation properties
    public virtual Goal Goal { get; set; } = null!;
    public virtual Payment? Payment { get; set; }
}