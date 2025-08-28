using BY.Core.DTOs;
using BY.Core.Entities;

namespace BY.Core.Interfaces;

public interface IUserService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<UserResponse>> GetUserProfileAsync(Guid userId);
    Task<ApiResponse<UserResponse>> UpdateUserProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<ApiResponse<bool>> VerifyEmailAsync(Guid userId, string token);
    Task<ApiResponse<bool>> SendPasswordResetAsync(string email);
    Task<ApiResponse<bool>> ResetPasswordAsync(string token, string newPassword);
}

public interface ICheckInService
{
    Task<ApiResponse<CheckInResponse>> CreateCheckInAsync(Guid userId, ThreeButtonCheckInRequest request);
    Task<ApiResponse<CheckInResponse>> UpdateCheckInAsync(Guid userId, Guid checkInId, UpdateCheckInRequest request);
    Task<ApiResponse<bool>> DeleteCheckInAsync(Guid userId, Guid checkInId);
    Task<ApiResponse<CheckInResponse?>> GetTodayCheckInAsync(Guid userId, Guid goalId);
    Task<ApiResponse<PagedResponse<CheckInResponse>>> GetCheckInsAsync(Guid userId, GetCheckInsRequest request);
    Task<ApiResponse<CheckInStatsResponse>> GetCheckInStatsAsync(Guid userId, Guid goalId);
    Task<ApiResponse<bool>> ProcessRemindLaterAsync(Guid userId, Guid goalId);
}

public interface IPaymentService
{
    Task<ApiResponse<bool>> ProcessStakePaymentAsync(Guid userId, Guid goalId, decimal amount);
    Task<ApiResponse<bool>> ProcessFailurePaymentAsync(Guid userId, Guid checkInId, decimal amount);
    Task<ApiResponse<bool>> RefundStakeAsync(Guid userId, Guid goalId);
    Task<ApiResponse<PagedResponse<PaymentResponse>>> GetPaymentHistoryAsync(Guid userId, PagedRequest request);
}

public interface INotificationService
{
    Task SendReminderNotificationAsync(Guid userId, Goal goal);
    Task SendEncouragementNotificationAsync(Guid userId, string message);
    Task SendPaymentNotificationAsync(Guid userId, Payment payment);
    Task SendGoalCompletionNotificationAsync(Guid userId, Goal goal);
}