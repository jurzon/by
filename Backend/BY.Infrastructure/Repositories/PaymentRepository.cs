using BY.Core.Entities;
using BY.Core.Enums;
using BY.Core.Interfaces;
using BY.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BY.Infrastructure.Repositories;

public class PaymentRepository : Repository<Payment>, IPaymentRepository
{
    public PaymentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Payment>> GetUserPaymentsAsync(Guid userId)
    {
        return await _dbSet
            .Where(p => p.UserId == userId)
            .Include(p => p.Goal)
            .Include(p => p.CheckIn)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Payment>> GetGoalPaymentsAsync(Guid goalId)
    {
        return await _dbSet
            .Where(p => p.GoalId == goalId)
            .Include(p => p.CheckIn)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<decimal> GetUserTotalPaidAsync(Guid userId)
    {
        return await _dbSet
            .Where(p => p.UserId == userId && 
                       p.Status == PaymentStatus.Completed &&
                       (p.Type == PaymentType.FailurePenalty || p.Type == PaymentType.ProcessingFee))
            .SumAsync(p => p.Amount);
    }

    public async Task<decimal> GetGoalTotalPaidAsync(Guid goalId)
    {
        return await _dbSet
            .Where(p => p.GoalId == goalId && 
                       p.Status == PaymentStatus.Completed &&
                       (p.Type == PaymentType.FailurePenalty || p.Type == PaymentType.ProcessingFee))
            .SumAsync(p => p.Amount);
    }

    public override async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(p => p.User)
            .Include(p => p.Goal)
            .Include(p => p.CheckIn)
            .FirstOrDefaultAsync(p => p.Id == id);
    }
}