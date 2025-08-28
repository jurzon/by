using BY.Core.DTOs;
using BY.Core.Enums;

namespace BY.Core.Interfaces;

public interface IGoalService
{
    Task<ApiResponse<GoalResponse>> CreateGoalAsync(Guid userId, CreateGoalRequest request);
    Task<ApiResponse<GoalResponse>> GetGoalByIdAsync(Guid goalId, Guid userId);
    Task<ApiResponse<IEnumerable<GoalResponse>>> GetUserGoalsAsync(Guid userId, GoalStatus? status = null, GoalCategory? category = null);
    Task<ApiResponse<IEnumerable<GoalResponse>>> GetActiveGoalsAsync(Guid userId);
    Task<ApiResponse<GoalResponse>> UpdateGoalAsync(Guid goalId, Guid userId, UpdateGoalRequest request);
    Task<ApiResponse<bool>> DeleteGoalAsync(Guid goalId, Guid userId);
    Task<ApiResponse<GoalResponse>> PauseGoalAsync(Guid goalId, Guid userId);
    Task<ApiResponse<GoalResponse>> ResumeGoalAsync(Guid goalId, Guid userId);
    Task<ApiResponse<CheckInResponse>> CheckInAsync(Guid goalId, Guid userId, CheckInRequest request);
    Task<ApiResponse<IEnumerable<CheckInResponse>>> GetGoalCheckInsAsync(Guid goalId, Guid userId, int page = 1, int limit = 30);
}