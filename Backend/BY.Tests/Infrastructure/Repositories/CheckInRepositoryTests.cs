using BY.Core.Entities;
using BY.Core.Enums;
using BY.Infrastructure.Repositories;
using FluentAssertions;

namespace BY.Tests.Infrastructure.Repositories;

public class CheckInRepositoryTests : TestBase
{
    private readonly CheckInRepository _checkInRepository;
    private readonly User _testUser;
    private readonly Goal _testGoal;

    public CheckInRepositoryTests()
    {
        _checkInRepository = new CheckInRepository(Context);
        
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
    public async Task AddAsync_ShouldAddCheckInToDatabase()
    {
        // Arrange
        var checkIn = new CheckIn
        {
            GoalId = _testGoal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Completed = true,
            Notes = "Great workout today!",
            CheckInTime = DateTime.UtcNow,
            StreakCount = 1
        };

        // Act
        var result = await _checkInRepository.AddAsync(checkIn);
        await Context.SaveChangesAsync();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        
        var savedCheckIn = await Context.CheckIns.FindAsync(result.Id);
        savedCheckIn.Should().NotBeNull();
        savedCheckIn!.GoalId.Should().Be(_testGoal.Id);
        savedCheckIn.Completed.Should().BeTrue();
        savedCheckIn.Notes.Should().Be("Great workout today!");
    }

    [Fact]
    public async Task GetGoalCheckInsAsync_ShouldReturnCheckInsForSpecificGoal()
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

        var checkIn1 = new CheckIn
        {
            GoalId = _testGoal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Completed = true,
            CheckInTime = DateTime.UtcNow,
            StreakCount = 1
        };

        var checkIn2 = new CheckIn
        {
            GoalId = _testGoal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-1)),
            Completed = false,
            CheckInTime = DateTime.UtcNow.AddDays(-1),
            PaymentProcessed = true,
            AmountCharged = 1.00m,
            StreakCount = 0
        };

        var checkIn3 = new CheckIn
        {
            GoalId = goal2.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Completed = true,
            CheckInTime = DateTime.UtcNow,
            StreakCount = 1
        };

        Context.CheckIns.AddRange(checkIn1, checkIn2, checkIn3);
        await Context.SaveChangesAsync();

        // Act
        var result = await _checkInRepository.GetGoalCheckInsAsync(_testGoal.Id);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(c => c.GoalId == _testGoal.Id);
        result.Should().Contain(c => c.Completed == true);
        result.Should().Contain(c => c.Completed == false && c.PaymentProcessed == true);
    }

    [Fact]
    public async Task GetTodayCheckInAsync_WithExistingCheckIn_ShouldReturnCheckIn()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var checkIn = new CheckIn
        {
            GoalId = _testGoal.Id,
            Date = today,
            Completed = true,
            Notes = "Today's check-in",
            CheckInTime = DateTime.UtcNow,
            StreakCount = 5
        };

        Context.CheckIns.Add(checkIn);
        await Context.SaveChangesAsync();

        // Act
        var result = await _checkInRepository.GetTodayCheckInAsync(_testGoal.Id, today);

        // Assert
        result.Should().NotBeNull();
        result!.GoalId.Should().Be(_testGoal.Id);
        result.Date.Should().Be(today);
        result.Completed.Should().BeTrue();
        result.Notes.Should().Be("Today's check-in");
    }

    [Fact]
    public async Task GetTodayCheckInAsync_WithNoCheckIn_ShouldReturnNull()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        // Act
        var result = await _checkInRepository.GetTodayCheckInAsync(_testGoal.Id, today);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserCheckInsAsync_ShouldReturnCheckInsInDateRange()
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

        var goal2 = new Goal
        {
            UserId = user2.Id,
            Title = "User 2 Goal",
            Description = "Goal for user 2",
            Category = GoalCategory.Learning,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 50.00m,
            DailyStakeAmount = 1.67m,
            ReminderTime = new TimeOnly(9, 0)
        };

        Context.Users.Add(user2);
        Context.Goals.Add(goal2);

        var checkIn1 = new CheckIn
        {
            GoalId = _testGoal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Completed = true,
            CheckInTime = DateTime.UtcNow,
            StreakCount = 1
        };

        var checkIn2 = new CheckIn
        {
            GoalId = _testGoal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-2)),
            Completed = false,
            CheckInTime = DateTime.UtcNow.AddDays(-2),
            StreakCount = 0
        };

        var checkIn3 = new CheckIn // Outside date range
        {
            GoalId = _testGoal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-10)),
            Completed = true,
            CheckInTime = DateTime.UtcNow.AddDays(-10),
            StreakCount = 1
        };

        var checkIn4 = new CheckIn // Different user
        {
            GoalId = goal2.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Completed = true,
            CheckInTime = DateTime.UtcNow,
            StreakCount = 1
        };

        Context.CheckIns.AddRange(checkIn1, checkIn2, checkIn3, checkIn4);
        await Context.SaveChangesAsync();

        // Act
        var fromDate = DateTime.UtcNow.Date.AddDays(-5);
        var toDate = DateTime.UtcNow.Date;
        var result = await _checkInRepository.GetUserCheckInsAsync(_testUser.Id, fromDate, toDate);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(c => c.Goal.UserId == _testUser.Id);
        result.Should().Contain(c => c.Date == DateOnly.FromDateTime(DateTime.UtcNow.Date));
        result.Should().Contain(c => c.Date == DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-2)));
        result.Should().NotContain(c => c.Date == DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-10)));
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateCheckInProperties()
    {
        // Arrange
        var checkIn = new CheckIn
        {
            GoalId = _testGoal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Completed = false,
            Notes = "Original notes",
            CheckInTime = DateTime.UtcNow,
            StreakCount = 0
        };

        Context.CheckIns.Add(checkIn);
        await Context.SaveChangesAsync();

        // Act
        checkIn.Completed = true;
        checkIn.Notes = "Updated notes";
        checkIn.StreakCount = 3;
        checkIn.PaymentProcessed = false;
        
        await _checkInRepository.UpdateAsync(checkIn);
        await Context.SaveChangesAsync();

        // Assert
        var updatedCheckIn = await Context.CheckIns.FindAsync(checkIn.Id);
        updatedCheckIn.Should().NotBeNull();
        updatedCheckIn!.Completed.Should().BeTrue();
        updatedCheckIn.Notes.Should().Be("Updated notes");
        updatedCheckIn.StreakCount.Should().Be(3);
        updatedCheckIn.PaymentProcessed.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveCheckInFromDatabase()
    {
        // Arrange
        var checkIn = new CheckIn
        {
            GoalId = _testGoal.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Completed = true,
            CheckInTime = DateTime.UtcNow,
            StreakCount = 1
        };

        Context.CheckIns.Add(checkIn);
        await Context.SaveChangesAsync();

        // Act
        await _checkInRepository.DeleteAsync(checkIn);
        await Context.SaveChangesAsync();

        // Assert
        var deletedCheckIn = await Context.CheckIns.FindAsync(checkIn.Id);
        deletedCheckIn.Should().BeNull();
    }
}