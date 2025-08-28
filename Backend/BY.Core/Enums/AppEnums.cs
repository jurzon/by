namespace BY.Core.Enums;

public enum GoalStatus
{
    Active,
    Completed,
    Failed,
    Paused,
    Cancelled
}

public enum GoalCategory
{
    Fitness,
    Learning,
    Habits,
    Finance,
    Career,
    Health,
    Personal,
    Other
}

public enum UserRole
{
    User,
    Admin,
    Moderator
}

public enum PaymentStatus
{
    Pending,
    Processing,
    Authorized,
    Completed,
    Failed,
    Refunded,
    Cancelled
}

public enum PaymentType
{
    StakeDeposit,
    Stake = StakeDeposit, // Alias for backwards compatibility
    FailurePenalty,
    Failure = FailurePenalty, // Alias for backwards compatibility
    Refund,
    ProcessingFee
}

public enum NotificationType
{
    Reminder,
    Encouragement,
    Social,
    System,
    Emergency
}