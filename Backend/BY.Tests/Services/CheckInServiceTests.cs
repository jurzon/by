using System;
using System.Threading.Tasks;
using BY.Core.DTOs;
using BY.Core.Entities;
using BY.Core.Enums;
using BY.Infrastructure.Data;
using BY.Infrastructure.Repositories;
using BY.Infrastructure.Services;
using BY.Core.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace BY.Tests.Services;

public class CheckInServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly UnitOfWork _uow;
    private readonly Mock<IPaymentService> _paymentMock = new();
    private readonly Mock<ILogger<CheckInService>> _loggerMock = new();
    private readonly CheckInService _service;
    private readonly User _user;
    private readonly Goal _goal;

    public CheckInServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _uow = new UnitOfWork(_context);
        _service = new CheckInService(_uow, _paymentMock.Object, _loggerMock.Object);

        _user = new User
        {
            Email = "svc@test.com",
            Username = "svcuser",
            FirstName = "Svc",
            LastName = "User",
            PasswordHash = "hash"
        };
        _context.Users.Add(_user);
        _goal = new Goal
        {
            UserId = _user.Id,
            Title = "Test Goal",
            Description = "Desc",
            Category = GoalCategory.Fitness,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(7),
            DurationDays = 7,
            TotalStakeAmount = 7m,
            DailyStakeAmount = 1m,
            ReminderTime = new TimeOnly(8,0)
        };
        _context.Goals.Add(_goal);
        _context.SaveChanges();
    }

    [Fact]
    public async Task CreateCheckIn_Success_Yes()
    {
        var req = new ThreeButtonCheckInRequest { GoalId = _goal.Id, Result = CheckInResult.Yes };

        var resp = await _service.CreateCheckInAsync(_user.Id, req);

        resp.Success.Should().BeTrue();
        resp.Data.Should().NotBeNull();
        resp.Data!.Completed.Should().BeTrue();
        resp.Message.ToLowerInvariant().Should().Contain("check-in");
    }

    [Fact]
    public async Task CreateCheckIn_Duplicate_Fails()
    {
        var req = new ThreeButtonCheckInRequest { GoalId = _goal.Id, Result = CheckInResult.Yes };
        (await _service.CreateCheckInAsync(_user.Id, req)).Success.Should().BeTrue();

        var dup = await _service.CreateCheckInAsync(_user.Id, req);

        dup.Success.Should().BeFalse();
        dup.Message.ToLowerInvariant().Should().Contain("already exists");
    }

    [Fact]
    public async Task CreateCheckIn_InactiveGoal_Fails()
    {
        _goal.Status = GoalStatus.Paused; // treat paused as inactive for test
        _context.Goals.Update(_goal);
        await _context.SaveChangesAsync();
        var req = new ThreeButtonCheckInRequest { GoalId = _goal.Id, Result = CheckInResult.Yes };

        var resp = await _service.CreateCheckInAsync(_user.Id, req);

        resp.Success.Should().BeFalse();
        resp.Message.ToLowerInvariant().Should().Contain("inactive");
    }

    [Fact]
    public async Task CreateCheckIn_RemindLater_ReturnsSuccessWithNullData()
    {
        var req = new ThreeButtonCheckInRequest { GoalId = _goal.Id, Result = CheckInResult.RemindLater };

        var resp = await _service.CreateCheckInAsync(_user.Id, req);

        resp.Success.Should().BeTrue();
        resp.Data.Should().BeNull();
        resp.Message.ToLowerInvariant().Should().Contain("reminder");
    }

    [Fact]
    public async Task GetTodayCheckIn_ReturnsDataAfterCreation()
    {
        var req = new ThreeButtonCheckInRequest { GoalId = _goal.Id, Result = CheckInResult.Yes };
        await _service.CreateCheckInAsync(_user.Id, req);

        var today = await _service.GetTodayCheckInAsync(_user.Id, _goal.Id);

        today.Success.Should().BeTrue();
        today.Data.Should().NotBeNull();
        today.Data!.GoalId.Should().Be(_goal.Id);
    }

    [Fact]
    public async Task GetTodayCheckIn_GoalWrongUser_Fails()
    {
        var otherUser = new User
        {
            Email = "other@test.com",
            Username = "other",
            FirstName = "Other",
            LastName = "User",
            PasswordHash = "hash"
        };
        _context.Users.Add(otherUser);
        await _context.SaveChangesAsync();

        var resp = await _service.GetTodayCheckInAsync(otherUser.Id, _goal.Id);
        resp.Success.Should().BeFalse();
        resp.Message.ToLowerInvariant().Should().Contain("does not belong");
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
