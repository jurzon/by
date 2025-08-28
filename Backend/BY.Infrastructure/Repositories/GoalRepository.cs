using BY.Core.Entities;
using BY.Core.Enums;
using BY.Core.Interfaces;
using BY.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BY.Infrastructure.Repositories;

public class GoalRepository : Repository<Goal>, IGoalRepository
{
    public GoalRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Goal>> GetUserGoalsAsync(Guid userId)
    {
        return await _dbSet
            .Where(g => g.UserId == userId)
            .Include(g => g.CheckIns.OrderByDescending(c => c.Date))
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Goal>> GetActiveGoalsAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(g => g.UserId == userId && 
                       g.Status == GoalStatus.Active && 
                       g.EndDate >= now)
            .Include(g => g.CheckIns.OrderByDescending(c => c.Date))
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Goal>> GetGoalsDueForReminderAsync(TimeOnly reminderTime)
    {
        var now = DateTime.UtcNow;
        var currentTime = TimeOnly.FromDateTime(now);
        
        // Get goals where reminder time matches (with some tolerance)
        var timeWindow = TimeSpan.FromMinutes(5);
        var startTime = reminderTime.Add(-timeWindow);
        var endTime = reminderTime.Add(timeWindow);
        
        return await _dbSet
            .Where(g => g.Status == GoalStatus.Active && 
                       g.EndDate >= now &&
                       g.ReminderTime >= startTime && 
                       g.ReminderTime <= endTime)
            .Include(g => g.User)
            .ToListAsync();
    }

    public async Task<Goal?> GetGoalWithCheckInsAsync(Guid goalId)
    {
        return await _dbSet
            .Include(g => g.CheckIns.OrderByDescending(c => c.Date))
            .Include(g => g.Payments.OrderByDescending(p => p.CreatedAt))
            .Include(g => g.User)
            .FirstOrDefaultAsync(g => g.Id == goalId);
    }

    public override async Task<Goal?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(g => g.User)
            .Include(g => g.CheckIns.OrderByDescending(c => c.Date))
            .FirstOrDefaultAsync(g => g.Id == id);
    }
}