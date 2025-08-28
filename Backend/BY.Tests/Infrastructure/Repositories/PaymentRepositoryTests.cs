using BY.Core.Entities;
using BY.Core.Enums;
using BY.Infrastructure.Repositories;
using FluentAssertions;

namespace BY.Tests.Infrastructure.Repositories;

public class PaymentRepositoryTests : TestBase
{
    private readonly PaymentRepository _paymentRepository;
    private readonly User _testUser;
    private readonly Goal _testGoal;

    public PaymentRepositoryTests()
    {
        _paymentRepository = new PaymentRepository(Context);
        
        _testUser = new User
        {
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };

        _testGoal = new Goal
        {
            UserId = _testUser.Id,
            Title = "Test Goal",
            Description = "Test goal description",
            Category = GoalCategory.Fitness,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 30.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = new TimeOnly(8, 0)
        };

        Context.Users.Add(_testUser);
        Context.Goals.Add(_testGoal);
        Context.SaveChanges();
    }

    [Fact]
    public async Task AddAsync_ShouldAddPaymentToDatabase()
    {
        // Arrange
        var payment = new Payment
        {
            UserId = _testUser.Id,
            GoalId = _testGoal.Id,
            Amount = 25.00m,
            Type = PaymentType.StakeDeposit,
            Status = PaymentStatus.Completed,
            ExternalTransactionId = "stripe_tx_12345",
            PaymentMethodId = "pm_12345",
            ProcessedAt = DateTime.UtcNow,
            Notes = "Initial stake deposit"
        };

        // Act
        var result = await _paymentRepository.AddAsync(payment);
        await Context.SaveChangesAsync();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        
        var savedPayment = await Context.Payments.FindAsync(result.Id);
        savedPayment.Should().NotBeNull();
        savedPayment!.UserId.Should().Be(_testUser.Id);
        savedPayment.GoalId.Should().Be(_testGoal.Id);
        savedPayment.Amount.Should().Be(25.00m);
        savedPayment.Type.Should().Be(PaymentType.StakeDeposit);
    }

    [Fact]
    public async Task GetUserPaymentsAsync_ShouldReturnPaymentsForSpecificUser()
    {
        // Arrange
        var user2 = new User
        {
            Email = "user2@example.com",
            Username = "user2",
            FirstName = "User",
            LastName = "Two",
            PasswordHash = "hashedpassword"
        };
        Context.Users.Add(user2);

        var payment1 = new Payment
        {
            UserId = _testUser.Id,
            GoalId = _testGoal.Id,
            Amount = 25.00m,
            Type = PaymentType.StakeDeposit,
            Status = PaymentStatus.Completed
        };

        var payment2 = new Payment
        {
            UserId = _testUser.Id,
            GoalId = _testGoal.Id,
            Amount = 1.00m,
            Type = PaymentType.FailurePenalty,
            Status = PaymentStatus.Completed
        };

        var payment3 = new Payment
        {
            UserId = user2.Id,
            Amount = 50.00m,
            Type = PaymentType.StakeDeposit,
            Status = PaymentStatus.Completed
        };

        Context.Payments.AddRange(payment1, payment2, payment3);
        await Context.SaveChangesAsync();

        // Act
        var result = await _paymentRepository.GetUserPaymentsAsync(_testUser.Id);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(p => p.UserId == _testUser.Id);
        result.Should().Contain(p => p.Type == PaymentType.StakeDeposit);
        result.Should().Contain(p => p.Type == PaymentType.FailurePenalty);
    }

    [Fact]
    public async Task GetGoalPaymentsAsync_ShouldReturnPaymentsForSpecificGoal()
    {
        // Arrange
        var goal2 = new Goal
        {
            UserId = _testUser.Id,
            Title = "Goal 2",
            Description = "Second test goal",
            Category = GoalCategory.Learning,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 50.00m,
            DailyStakeAmount = 1.67m,
            ReminderTime = new TimeOnly(9, 0)
        };
        Context.Goals.Add(goal2);

        var payment1 = new Payment
        {
            UserId = _testUser.Id,
            GoalId = _testGoal.Id,
            Amount = 25.00m,
            Type = PaymentType.StakeDeposit,
            Status = PaymentStatus.Completed
        };

        var payment2 = new Payment
        {
            UserId = _testUser.Id,
            GoalId = _testGoal.Id,
            Amount = 1.00m,
            Type = PaymentType.FailurePenalty,
            Status = PaymentStatus.Completed
        };

        var payment3 = new Payment
        {
            UserId = _testUser.Id,
            GoalId = goal2.Id,
            Amount = 50.00m,
            Type = PaymentType.StakeDeposit,
            Status = PaymentStatus.Completed
        };

        Context.Payments.AddRange(payment1, payment2, payment3);
        await Context.SaveChangesAsync();

        // Act
        var result = await _paymentRepository.GetGoalPaymentsAsync(_testGoal.Id);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(p => p.GoalId == _testGoal.Id);
        result.Should().Contain(p => p.Amount == 25.00m);
        result.Should().Contain(p => p.Amount == 1.00m);
    }

    [Fact]
    public async Task GetUserTotalPaidAsync_ShouldReturnSumOfFailurePenaltiesAndFees()
    {
        // Arrange
        var payments = new[]
        {
            new Payment
            {
                UserId = _testUser.Id,
                GoalId = _testGoal.Id,
                Amount = 25.00m,
                Type = PaymentType.StakeDeposit, // Should not be included
                Status = PaymentStatus.Completed
            },
            new Payment
            {
                UserId = _testUser.Id,
                GoalId = _testGoal.Id,
                Amount = 1.00m,
                Type = PaymentType.FailurePenalty, // Should be included
                Status = PaymentStatus.Completed
            },
            new Payment
            {
                UserId = _testUser.Id,
                GoalId = _testGoal.Id,
                Amount = 2.50m,
                Type = PaymentType.ProcessingFee, // Should be included
                Status = PaymentStatus.Completed
            },
            new Payment
            {
                UserId = _testUser.Id,
                GoalId = _testGoal.Id,
                Amount = 1.50m,
                Type = PaymentType.FailurePenalty,
                Status = PaymentStatus.Pending // Should not be included (not completed)
            },
            new Payment
            {
                UserId = _testUser.Id,
                Amount = 10.00m,
                Type = PaymentType.Refund, // Should not be included
                Status = PaymentStatus.Completed
            }
        };

        Context.Payments.AddRange(payments);
        await Context.SaveChangesAsync();

        // Act
        var result = await _paymentRepository.GetUserTotalPaidAsync(_testUser.Id);

        // Assert
        result.Should().Be(3.50m); // 1.00 (failure) + 2.50 (processing fee)
    }

    [Fact]
    public async Task GetGoalTotalPaidAsync_ShouldReturnSumOfFailurePenaltiesAndFeesForGoal()
    {
        // Arrange
        var goal2 = new Goal
        {
            UserId = _testUser.Id,
            Title = "Goal 2",
            Description = "Second test goal",
            Category = GoalCategory.Learning,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 50.00m,
            DailyStakeAmount = 1.67m,
            ReminderTime = new TimeOnly(9, 0)
        };
        Context.Goals.Add(goal2);

        var payments = new[]
        {
            new Payment
            {
                UserId = _testUser.Id,
                GoalId = _testGoal.Id,
                Amount = 1.00m,
                Type = PaymentType.FailurePenalty,
                Status = PaymentStatus.Completed
            },
            new Payment
            {
                UserId = _testUser.Id,
                GoalId = _testGoal.Id,
                Amount = 1.50m,
                Type = PaymentType.FailurePenalty,
                Status = PaymentStatus.Completed
            },
            new Payment
            {
                UserId = _testUser.Id,
                GoalId = goal2.Id, // Different goal
                Amount = 2.00m,
                Type = PaymentType.FailurePenalty,
                Status = PaymentStatus.Completed
            },
            new Payment
            {
                UserId = _testUser.Id,
                GoalId = _testGoal.Id,
                Amount = 0.75m,
                Type = PaymentType.ProcessingFee,
                Status = PaymentStatus.Completed
            }
        };

        Context.Payments.AddRange(payments);
        await Context.SaveChangesAsync();

        // Act
        var result = await _paymentRepository.GetGoalTotalPaidAsync(_testGoal.Id);

        // Assert
        result.Should().Be(3.25m); // 1.00 + 1.50 + 0.75 (only for testGoal)
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdatePaymentProperties()
    {
        // Arrange
        var payment = new Payment
        {
            UserId = _testUser.Id,
            GoalId = _testGoal.Id,
            Amount = 25.00m,
            Type = PaymentType.StakeDeposit,
            Status = PaymentStatus.Pending,
            ExternalTransactionId = "temp_id",
            Notes = "Pending payment"
        };

        Context.Payments.Add(payment);
        await Context.SaveChangesAsync();

        // Act
        payment.Status = PaymentStatus.Completed;
        payment.ExternalTransactionId = "stripe_tx_12345";
        payment.ProcessedAt = DateTime.UtcNow;
        payment.Notes = "Payment completed successfully";
        
        await _paymentRepository.UpdateAsync(payment);
        await Context.SaveChangesAsync();

        // Assert
        var updatedPayment = await Context.Payments.FindAsync(payment.Id);
        updatedPayment.Should().NotBeNull();
        updatedPayment!.Status.Should().Be(PaymentStatus.Completed);
        updatedPayment.ExternalTransactionId.Should().Be("stripe_tx_12345");
        updatedPayment.ProcessedAt.Should().NotBeNull();
        updatedPayment.Notes.Should().Be("Payment completed successfully");
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemovePaymentFromDatabase()
    {
        // Arrange
        var payment = new Payment
        {
            UserId = _testUser.Id,
            GoalId = _testGoal.Id,
            Amount = 25.00m,
            Type = PaymentType.StakeDeposit,
            Status = PaymentStatus.Completed
        };

        Context.Payments.Add(payment);
        await Context.SaveChangesAsync();

        // Act
        await _paymentRepository.DeleteAsync(payment);
        await Context.SaveChangesAsync();

        // Assert
        var deletedPayment = await Context.Payments.FindAsync(payment.Id);
        deletedPayment.Should().BeNull();
    }
}