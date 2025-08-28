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
        return await _dbSet
            .Include(c => c.Payment)
            .FirstOrDefaultAsync(c => c.GoalId == goalId && c.Date == date);
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