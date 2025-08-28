using BY.Core.Entities;
using BY.Core.Enums;
using BY.Infrastructure.Repositories;
using FluentAssertions;

namespace BY.Tests.Infrastructure.Repositories;

public class UserRepositoryTests : TestBase
{
    private readonly UserRepository _userRepository;

    public UserRepositoryTests()
    {
        _userRepository = new UserRepository(Context);
    }

    [Fact]
    public async Task AddAsync_ShouldAddUserToDatabase()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword",
            Role = UserRole.User,
            IsActive = true,
            DefaultReminderTime = new TimeOnly(8, 0),
            PreferredCategories = new[] { GoalCategory.Fitness },
            DefaultStakeAmount = 25.00m
        };

        // Act
        var result = await _userRepository.AddAsync(user);
        await Context.SaveChangesAsync();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        
        var savedUser = await Context.Users.FindAsync(result.Id);
        savedUser.Should().NotBeNull();
        savedUser!.Email.Should().Be("test@example.com");
        savedUser.Username.Should().Be("testuser");
    }

    [Fact]
    public async Task GetByEmailAsync_WithExistingEmail_ShouldReturnUser()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // Act
        var result = await _userRepository.GetByEmailAsync("test@example.com");

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be("test@example.com");
        result.Username.Should().Be("testuser");
    }

    [Fact]
    public async Task GetByEmailAsync_WithNonExistingEmail_ShouldReturnNull()
    {
        // Act
        var result = await _userRepository.GetByEmailAsync("nonexistent@example.com");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByEmailAsync_ShouldBeCaseInsensitive()
    {
        // Arrange
        var user = new User
        {
            Email = "Test@Example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // Act
        var result = await _userRepository.GetByEmailAsync("test@example.com");

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be("Test@Example.com");
    }

    [Fact]
    public async Task GetByUsernameAsync_WithExistingUsername_ShouldReturnUser()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            Username = "TestUser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // Act
        var result = await _userRepository.GetByUsernameAsync("testuser");

        // Assert
        result.Should().NotBeNull();
        result!.Username.Should().Be("TestUser");
    }

    [Fact]
    public async Task IsEmailTakenAsync_WithExistingEmail_ShouldReturnTrue()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // Act
        var result = await _userRepository.IsEmailTakenAsync("test@example.com");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsEmailTakenAsync_WithNonExistingEmail_ShouldReturnFalse()
    {
        // Act
        var result = await _userRepository.IsEmailTakenAsync("nonexistent@example.com");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsUsernameTakenAsync_WithExistingUsername_ShouldReturnTrue()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // Act
        var result = await _userRepository.IsUsernameTakenAsync("testuser");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateUserProperties()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // Act
        user.FirstName = "Updated";
        user.LastName = "Name";
        await _userRepository.UpdateAsync(user);
        await Context.SaveChangesAsync();

        // Assert
        var updatedUser = await Context.Users.FindAsync(user.Id);
        updatedUser.Should().NotBeNull();
        updatedUser!.FirstName.Should().Be("Updated");
        updatedUser.LastName.Should().Be("Name");
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveUserFromDatabase()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hashedpassword"
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // Act
        await _userRepository.DeleteAsync(user);
        await Context.SaveChangesAsync();

        // Assert
        var deletedUser = await Context.Users.FindAsync(user.Id);
        deletedUser.Should().BeNull();
    }
}