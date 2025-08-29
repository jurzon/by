using BY.Core.Entities;
using BY.Core.Interfaces;
using BY.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BY.Infrastructure.Repositories;

public class CheckInRepository : Repository<CheckIn>, ICheckInRepository
{
    public CheckInRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<CheckIn>> GetGoalCheckInsAsync(Guid goalId)
    {
        return await _dbSet
            .Where(c => c.GoalId == goalId)
            .Include(c => c.Payment)
            .OrderByDescending(c => c.Date)
            .ToListAsync();
    }

    public async Task<CheckIn?> GetTodayCheckInAsync(Guid goalId, DateOnly date)
    {
        // Convert DateOnly to UTC DateTime range to avoid PostgreSQL timezone issues
        var startOfDay = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endOfDay = date.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
        
        return await _dbSet
            .Include(c => c.Payment)
            .Where(c => c.GoalId == goalId && c.Date == date)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<CheckIn>> GetUserCheckInsAsync(Guid userId, DateTime fromDate, DateTime toDate)
    {
        var fromDateOnly = DateOnly.FromDateTime(fromDate);
        var toDateOnly = DateOnly.FromDateTime(toDate);
        
        return await _dbSet
            .Include(c => c.Goal)
            .Include(c => c.Payment)
            .Where(c => c.Goal.UserId == userId && 
                       c.Date >= fromDateOnly && 
                       c.Date <= toDateOnly)
            .OrderByDescending(c => c.Date)
            .ToListAsync();
    }

    public override async Task<CheckIn?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(c => c.Goal)
            .Include(c => c.Payment)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
}