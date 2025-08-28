using BY.Core.Entities;
using BY.Core.Interfaces;
using BY.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace BY.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    // Repository instances
    private IUserRepository? _users;
    private IGoalRepository? _goals;
    private ICheckInRepository? _checkIns;
    private IPaymentRepository? _payments;
    private IRepository<UserPreferences>? _userPreferences;
    private IRefreshTokenRepository? _refreshTokens;
    private IRepository<Community>? _communities;
    private IRepository<CommunityMember>? _communityMembers;
    private IRepository<CommunityPost>? _communityPosts;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IGoalRepository Goals => _goals ??= new GoalRepository(_context);
    public ICheckInRepository CheckIns => _checkIns ??= new CheckInRepository(_context);
    public IPaymentRepository Payments => _payments ??= new PaymentRepository(_context);
    public IRepository<UserPreferences> UserPreferences => _userPreferences ??= new Repository<UserPreferences>(_context);
    public IRefreshTokenRepository RefreshTokens => _refreshTokens ??= new RefreshTokenRepository(_context);
    public IRepository<Community> Communities => _communities ??= new Repository<Community>(_context);
    public IRepository<CommunityMember> CommunityMembers => _communityMembers ??= new Repository<CommunityMember>(_context);
    public IRepository<CommunityPost> CommunityPosts => _communityPosts ??= new Repository<CommunityPost>(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}