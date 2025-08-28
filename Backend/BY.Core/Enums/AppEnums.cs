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
    Completed,
    Failed,
    Refunded,
    Cancelled
}

public enum PaymentType
{
    StakeDeposit,
    FailurePenalty,
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