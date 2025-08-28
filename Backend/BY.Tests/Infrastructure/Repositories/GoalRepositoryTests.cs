using BY.Core.Entities;
using BY.Core.Enums;
using BY.Infrastructure.Repositories;
using FluentAssertions;

namespace BY.Tests.Infrastructure.Repositories;

public class GoalRepositoryTests : TestBase
{
    private readonly GoalRepository _goalRepository;
    private readonly User _testUser;

    public GoalRepositoryTests()
    {
        _goalRepository = new GoalRepository(Context);
        
        _testUser = new User
        {
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };
        
        Context.Users.Add(_testUser);
        Context.SaveChanges();
    }

    [Fact]
    public async Task AddAsync_ShouldAddGoalToDatabase()
    {
        // Arrange
        var goal = new Goal
        {
            UserId = _testUser.Id,
            Title = "Daily Exercise",
            Description = "Exercise for 30 minutes every day",
            Category = GoalCategory.Fitness,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 30.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = new TimeOnly(8, 0),
            ReminderMessage = "Time to exercise!"
        };

        // Act
        var result = await _goalRepository.AddAsync(goal);
        await Context.SaveChangesAsync();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        
        var savedGoal = await Context.Goals.FindAsync(result.Id);
        savedGoal.Should().NotBeNull();
        savedGoal!.Title.Should().Be("Daily Exercise");
        savedGoal.UserId.Should().Be(_testUser.Id);
    }

    [Fact]
    public async Task GetUserGoalsAsync_ShouldReturnUserGoalsOnly()
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

        var goal1 = new Goal
        {
            UserId = _testUser.Id,
            Title = "Goal 1",
            Description = "Test goal 1",
            Category = GoalCategory.Fitness,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 25.00m,
            DailyStakeAmount = 0.83m,
            ReminderTime = new TimeOnly(8, 0)
        };

        var goal2 = new Goal
        {
            UserId = user2.Id,
            Title = "Goal 2",
            Description = "Test goal 2",
            Category = GoalCategory.Learning,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 50.00m,
            DailyStakeAmount = 1.67m,
            ReminderTime = new TimeOnly(9, 0)
        };

        var goal3 = new Goal
        {
            UserId = _testUser.Id,
            Title = "Goal 3",
            Description = "Test goal 3",
            Category = GoalCategory.Habits,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(21),
            DurationDays = 21,
            TotalStakeAmount = 21.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = new TimeOnly(7, 0)
        };

        Context.Goals.AddRange(goal1, goal2, goal3);
        await Context.SaveChangesAsync();

        // Act
        var result = await _goalRepository.GetUserGoalsAsync(_testUser.Id);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(g => g.UserId == _testUser.Id);
        result.Select(g => g.Title).Should().Contain(new[] { "Goal 1", "Goal 3" });
    }

    [Fact]
    public async Task GetActiveGoalsAsync_ShouldReturnOnlyActiveGoals()
    {
        // Arrange
        var activeGoal = new Goal
        {
            UserId = _testUser.Id,
            Title = "Active Goal",
            Description = "Active test goal",
            Category = GoalCategory.Fitness,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 30.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = new TimeOnly(8, 0)
        };

        var completedGoal = new Goal
        {
            UserId = _testUser.Id,
            Title = "Completed Goal",
            Description = "Completed test goal",
            Category = GoalCategory.Learning,
            Status = GoalStatus.Completed,
            StartDate = DateTime.UtcNow.Date.AddDays(-30),
            EndDate = DateTime.UtcNow.Date.AddDays(-1),
            DurationDays = 30,
            TotalStakeAmount = 50.00m,
            DailyStakeAmount = 1.67m,
            ReminderTime = new TimeOnly(9, 0),
            CompletedAt = DateTime.UtcNow.AddDays(-1),
            IsSuccessful = true
        };

        var expiredGoal = new Goal
        {
            UserId = _testUser.Id,
            Title = "Expired Goal",
            Description = "Expired test goal",
            Category = GoalCategory.Habits,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date.AddDays(-30),
            EndDate = DateTime.UtcNow.Date.AddDays(-1), // Expired
            DurationDays = 30,
            TotalStakeAmount = 30.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = new TimeOnly(7, 0)
        };

        Context.Goals.AddRange(activeGoal, completedGoal, expiredGoal);
        await Context.SaveChangesAsync();

        // Act
        var result = await _goalRepository.GetActiveGoalsAsync(_testUser.Id);

        // Assert
        result.Should().HaveCount(1);
        result.First().Title.Should().Be("Active Goal");
        result.First().Status.Should().Be(GoalStatus.Active);
    }

    [Fact]
    public async Task GetGoalsDueForReminderAsync_ShouldReturnGoalsWithMatchingReminderTime()
    {
        // Arrange
        var reminderTime = new TimeOnly(8, 0);
        
        var goalWithMatchingTime = new Goal
        {
            UserId = _testUser.Id,
            Title = "Morning Goal",
            Description = "Goal with 8 AM reminder",
            Category = GoalCategory.Fitness,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 30.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = reminderTime
        };

        var goalWithDifferentTime = new Goal
        {
            UserId = _testUser.Id,
            Title = "Evening Goal",
            Description = "Goal with 8 PM reminder",
            Category = GoalCategory.Learning,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 50.00m,
            DailyStakeAmount = 1.67m,
            ReminderTime = new TimeOnly(20, 0)
        };

        var inactiveGoal = new Goal
        {
            UserId = _testUser.Id,
            Title = "Inactive Goal",
            Description = "Inactive goal with matching time",
            Category = GoalCategory.Habits,
            Status = GoalStatus.Paused,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 30.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = reminderTime
        };

        Context.Goals.AddRange(goalWithMatchingTime, goalWithDifferentTime, inactiveGoal);
        await Context.SaveChangesAsync();

        // Act
        var result = await _goalRepository.GetGoalsDueForReminderAsync(reminderTime);

        // Assert
        result.Should().HaveCount(1);
        result.First().Title.Should().Be("Morning Goal");
        result.First().ReminderTime.Should().Be(reminderTime);
        result.First().Status.Should().Be(GoalStatus.Active);
    }

    [Fact]
    public async Task GetGoalWithCheckInsAsync_ShouldIncludeCheckInsAndPayments()
    {
        // Arrange
        var goal = new Goal
        {
            UserId = _testUser.Id,
            Title = "Test Goal",
            Description = "Goal with check-ins",
            Category = GoalCategory.Fitness,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(7),
            DurationDays = 7,
            TotalStakeAmount = 7.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = new TimeOnly(8, 0)
        };

        Context.Goals.Add(goal);
        await Context.SaveChangesAsync();

        var checkIn1 = new CheckIn
        {
            GoalId = goal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Completed = true,
            Notes = "Great workout!",
            CheckInTime = DateTime.UtcNow,
            StreakCount = 1
        };

        var checkIn2 = new CheckIn
        {
            GoalId = goal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-1)),
            Completed = false,
            Notes = "Missed it",
            CheckInTime = DateTime.UtcNow.AddDays(-1),
            PaymentProcessed = true,
            AmountCharged = 1.00m,
            StreakCount = 0
        };

        Context.CheckIns.AddRange(checkIn1, checkIn2);
        await Context.SaveChangesAsync();

        // Act
        var result = await _goalRepository.GetGoalWithCheckInsAsync(goal.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be("Test Goal");
        result.CheckIns.Should().HaveCount(2);
        result.CheckIns.Should().Contain(c => c.Completed == true);
        result.CheckIns.Should().Contain(c => c.Completed == false && c.PaymentProcessed == true);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateGoalProperties()
    {
        // Arrange
        var goal = new Goal
        {
            UserId = _testUser.Id,
            Title = "Original Title",
            Description = "Original description",
            Category = GoalCategory.Fitness,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 30.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = new TimeOnly(8, 0)
        };

        Context.Goals.Add(goal);
        await Context.SaveChangesAsync();

        // Act
        goal.Title = "Updated Title";
        goal.Description = "Updated description";
        goal.SuccessfulDays = 5;
        goal.CurrentStreak = 3;
        
        await _goalRepository.UpdateAsync(goal);
        await Context.SaveChangesAsync();

        // Assert
        var updatedGoal = await Context.Goals.FindAsync(goal.Id);
        updatedGoal.Should().NotBeNull();
        updatedGoal!.Title.Should().Be("Updated Title");
        updatedGoal.Description.Should().Be("Updated description");
        updatedGoal.SuccessfulDays.Should().Be(5);
        updatedGoal.CurrentStreak.Should().Be(3);
    }
}