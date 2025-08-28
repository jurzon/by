using BY.Core.Entities;
using System.Linq.Expressions;

namespace BY.Core.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<T?> GetFirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> GetWhereAsync(Expression<Func<T, bool>> predicate);
    Task<(IEnumerable<T> Items, int Total)> GetPagedAsync(int page, int limit, Expression<Func<T, bool>>? predicate = null);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<bool> IsEmailTakenAsync(string email);
    Task<bool> IsUsernameTakenAsync(string username);
}

public interface IGoalRepository : IRepository<Goal>
{
    Task<IEnumerable<Goal>> GetUserGoalsAsync(Guid userId);
    Task<IEnumerable<Goal>> GetActiveGoalsAsync(Guid userId);
    Task<IEnumerable<Goal>> GetGoalsDueForReminderAsync(TimeOnly reminderTime);
    Task<Goal?> GetGoalWithCheckInsAsync(Guid goalId);
}

public interface ICheckInRepository : IRepository<CheckIn>
{
    Task<IEnumerable<CheckIn>> GetGoalCheckInsAsync(Guid goalId);
    Task<CheckIn?> GetTodayCheckInAsync(Guid goalId, DateOnly date);
    Task<IEnumerable<CheckIn>> GetUserCheckInsAsync(Guid userId, DateTime fromDate, DateTime toDate);
}

public interface IPaymentRepository : IRepository<Payment>
{
    Task<IEnumerable<Payment>> GetUserPaymentsAsync(Guid userId);
    Task<IEnumerable<Payment>> GetGoalPaymentsAsync(Guid goalId);
    Task<decimal> GetUserTotalPaidAsync(Guid userId);
    Task<decimal> GetGoalTotalPaidAsync(Guid goalId);
}

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<IEnumerable<RefreshToken>> GetUserActiveTokensAsync(Guid userId);
    Task RevokeAllUserTokensAsync(Guid userId);
    Task RevokeTokenAsync(string token);
    Task CleanupExpiredTokensAsync();
}

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IGoalRepository Goals { get; }
    ICheckInRepository CheckIns { get; }
    IPaymentRepository Payments { get; }
    IRefreshTokenRepository RefreshTokens { get; }
    IRepository<UserPreferences> UserPreferences { get; }
    IRepository<Community> Communities { get; }
    IRepository<CommunityMember> CommunityMembers { get; }
    IRepository<CommunityPost> CommunityPosts { get; }
    
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}