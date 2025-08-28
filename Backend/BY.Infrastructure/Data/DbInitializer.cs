using BY.Core.Entities;
using BY.Core.Enums;
using BY.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace BY.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();
            
            // Apply any pending migrations
            if (context.Database.GetPendingMigrations().Any())
            {
                logger.LogInformation("Applying pending migrations...");
                await context.Database.MigrateAsync();
            }

            // Seed data if needed
            await SeedDataAsync(context, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing the database");
            throw;
        }
    }

    private static async Task SeedDataAsync(ApplicationDbContext context, ILogger logger)
    {
        // Check if we already have data
        if (await context.Users.AnyAsync())
        {
            logger.LogInformation("Database already contains data. Skipping seeding.");
            return;
        }

        logger.LogInformation("Seeding database with initial data...");

        // Create admin user
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@byapp.com",
            Username = "admin",
            FirstName = "Admin",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"), // In production, use proper password hashing
            Role = UserRole.Admin,
            IsActive = true,
            IsEmailVerified = true,
            DefaultReminderTime = new TimeOnly(7, 0),
            PreferredCategories = new[] { GoalCategory.Fitness, GoalCategory.Learning },
            DefaultStakeAmount = 25.00m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Create test user
        var testUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
            Role = UserRole.User,
            IsActive = true,
            IsEmailVerified = true,
            DefaultReminderTime = new TimeOnly(8, 0),
            PreferredCategories = new[] { GoalCategory.Fitness, GoalCategory.Habits },
            DefaultStakeAmount = 30.00m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(adminUser, testUser);

        // Create user preferences
        var adminPreferences = new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = adminUser.Id,
            EmailNotifications = true,
            PushNotifications = true,
            SmsNotifications = false,
            QuietHoursStart = new TimeOnly(22, 0),
            QuietHoursEnd = new TimeOnly(7, 0),
            FavoriteCategories = new[] { GoalCategory.Fitness, GoalCategory.Learning },
            PreferredStakeAmount = 25.00m,
            PreferredGoalDuration = 30,
            PreferredReminderTime = new TimeOnly(7, 0),
            Timezone = "UTC",
            Currency = "USD",
            DarkMode = false,
            ProfilePublic = false,
            ShowInLeaderboards = true,
            AllowCommunityMessages = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var testUserPreferences = new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = testUser.Id,
            EmailNotifications = true,
            PushNotifications = true,
            SmsNotifications = false,
            QuietHoursStart = new TimeOnly(23, 0),
            QuietHoursEnd = new TimeOnly(7, 0),
            FavoriteCategories = new[] { GoalCategory.Fitness, GoalCategory.Habits },
            PreferredStakeAmount = 30.00m,
            PreferredGoalDuration = 21,
            PreferredReminderTime = new TimeOnly(8, 0),
            Timezone = "UTC",
            Currency = "USD",
            DarkMode = true,
            ProfilePublic = true,
            ShowInLeaderboards = true,
            AllowCommunityMessages = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.UserPreferences.AddRange(adminPreferences, testUserPreferences);

        // Create a sample goal for the test user
        var sampleGoal = new Goal
        {
            Id = Guid.NewGuid(),
            UserId = testUser.Id,
            Title = "Daily Exercise",
            Description = "Complete 30 minutes of exercise every day",
            Category = GoalCategory.Fitness,
            Status = GoalStatus.Active,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            DurationDays = 30,
            TotalStakeAmount = 30.00m,
            DailyStakeAmount = 1.00m,
            ReminderTime = new TimeOnly(8, 0),
            ReminderMessage = "Time for your daily workout! ??",
            SuccessfulDays = 0,
            FailedDays = 0,
            MissedDays = 0,
            CurrentStreak = 0,
            LongestStreak = 0,
            TotalPaid = 0,
            CompletedAt = null,
            IsSuccessful = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Goals.Add(sampleGoal);

        // Create a sample community
        var sampleCommunity = new Community
        {
            Id = Guid.NewGuid(),
            Name = "Fitness Enthusiasts",
            Description = "A community for people focused on fitness goals",
            IsPublic = true,
            CreatedByUserId = adminUser.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Communities.Add(sampleCommunity);

        // Add community members
        var communityMembers = new[]
        {
            new CommunityMember
            {
                Id = Guid.NewGuid(),
                CommunityId = sampleCommunity.Id,
                UserId = adminUser.Id,
                Role = "Admin",
                JoinedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CommunityMember
            {
                Id = Guid.NewGuid(),
                CommunityId = sampleCommunity.Id,
                UserId = testUser.Id,
                Role = "Member",
                JoinedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.CommunityMembers.AddRange(communityMembers);

        // Save all changes
        await context.SaveChangesAsync();
        
        logger.LogInformation("Database seeding completed successfully.");
        logger.LogInformation("Admin user: admin@byapp.com / Admin123!");
        logger.LogInformation("Test user: test@example.com / Test123!");
    }
}