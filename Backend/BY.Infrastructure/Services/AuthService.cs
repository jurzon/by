using BY.Core.DTOs;
using BY.Core.Entities;
using BY.Core.Enums;
using BY.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace BY.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly IPasswordService _passwordService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUnitOfWork unitOfWork,
        IJwtService jwtService,
        IPasswordService passwordService,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _passwordService = passwordService;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        try
        {
            // Validate input
            var validationErrors = await ValidateRegistrationRequest(request);
            if (validationErrors.Any())
            {
                return ApiResponse<AuthResponse>.FailureResult("Validation failed", validationErrors);
            }

            // Check if email already exists
            if (await _unitOfWork.Users.IsEmailTakenAsync(request.Email))
            {
                return ApiResponse<AuthResponse>.FailureResult("Email address is already registered");
            }

            // Check if username already exists
            if (await _unitOfWork.Users.IsUsernameTakenAsync(request.Username))
            {
                return ApiResponse<AuthResponse>.FailureResult("Username is already taken");
            }

            // Create new user
            var user = new User
            {
                Email = request.Email.ToLowerInvariant(),
                Username = request.Username,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = _passwordService.HashPassword(request.Password),
                Role = UserRole.User,
                IsActive = true,
                IsEmailVerified = false, // Email verification can be implemented later
                DefaultReminderTime = new TimeOnly(8, 0),
                PreferredCategories = Array.Empty<GoalCategory>(),
                DefaultStakeAmount = 25.00m
            };

            // Create default user preferences
            var preferences = new UserPreferences
            {
                UserId = user.Id,
                EmailNotifications = true,
                PushNotifications = true,
                SmsNotifications = false,
                QuietHoursStart = new TimeOnly(22, 0),
                QuietHoursEnd = new TimeOnly(7, 0),
                FavoriteCategories = Array.Empty<GoalCategory>(),
                PreferredStakeAmount = 25.00m,
                PreferredGoalDuration = 30,
                PreferredReminderTime = new TimeOnly(8, 0),
                Timezone = "UTC",
                Currency = "USD",
                DarkMode = false,
                ProfilePublic = false,
                ShowInLeaderboards = true,
                AllowCommunityMessages = true
            };

            // Save user and preferences
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.UserPreferences.AddAsync(preferences);
            await _unitOfWork.SaveChangesAsync();

            // Generate tokens
            var accessToken = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());
            var refreshToken = _jwtService.GenerateRefreshToken();

            // Save refresh token
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(30), // 30-day refresh token
                IsRevoked = false
            };

            await _unitOfWork.RefreshTokens.AddAsync(refreshTokenEntity);
            await _unitOfWork.SaveChangesAsync();

            var userResponse = MapToUserResponse(user);
            var authResponse = new AuthResponse
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                User = userResponse,
                ExpiresAt = _jwtService.GetTokenExpiration(accessToken)
            };

            _logger.LogInformation("User registered successfully: {Email}", user.Email);
            return ApiResponse<AuthResponse>.SuccessResult(authResponse, "Registration successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration: {Email}", request.Email);
            return ApiResponse<AuthResponse>.FailureResult("An error occurred during registration");
        }
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        try
        {
            // Find user by email
            var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning("Login attempt with non-existent email: {Email}", request.Email);
                return ApiResponse<AuthResponse>.FailureResult("Invalid email or password");
            }

            // Check if user is active
            if (!user.IsActive)
            {
                _logger.LogWarning("Login attempt for inactive user: {Email}", request.Email);
                return ApiResponse<AuthResponse>.FailureResult("Account is deactivated");
            }

            // Verify password
            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Failed login attempt for user: {Email}", request.Email);
                return ApiResponse<AuthResponse>.FailureResult("Invalid email or password");
            }

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _unitOfWork.Users.UpdateAsync(user);

            // Generate tokens
            var accessToken = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());
            var refreshToken = _jwtService.GenerateRefreshToken();

            // Save refresh token
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                IsRevoked = false
            };

            await _unitOfWork.RefreshTokens.AddAsync(refreshTokenEntity);
            await _unitOfWork.SaveChangesAsync();

            var userResponse = MapToUserResponse(user);
            var authResponse = new AuthResponse
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                User = userResponse,
                ExpiresAt = _jwtService.GetTokenExpiration(accessToken)
            };

            _logger.LogInformation("User logged in successfully: {Email}", user.Email);
            return ApiResponse<AuthResponse>.SuccessResult(authResponse, "Login successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user login: {Email}", request.Email);
            return ApiResponse<AuthResponse>.FailureResult("An error occurred during login");
        }
    }

    public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            // Validate refresh token format
            if (!_jwtService.ValidateRefreshToken(refreshToken))
            {
                return ApiResponse<AuthResponse>.FailureResult("Invalid refresh token format");
            }

            // Find refresh token in database
            var tokenEntity = await _unitOfWork.RefreshTokens.GetByTokenAsync(refreshToken);
            if (tokenEntity == null || !tokenEntity.IsActive)
            {
                _logger.LogWarning("Invalid or expired refresh token used");
                return ApiResponse<AuthResponse>.FailureResult("Invalid or expired refresh token");
            }

            // Get user
            var user = tokenEntity.User;
            if (!user.IsActive)
            {
                return ApiResponse<AuthResponse>.FailureResult("Account is deactivated");
            }

            // Revoke old refresh token
            tokenEntity.IsRevoked = true;
            await _unitOfWork.RefreshTokens.UpdateAsync(tokenEntity);

            // Generate new tokens
            var newAccessToken = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // Save new refresh token
            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                IsRevoked = false
            };

            await _unitOfWork.RefreshTokens.AddAsync(newRefreshTokenEntity);
            await _unitOfWork.SaveChangesAsync();

            var userResponse = MapToUserResponse(user);
            var authResponse = new AuthResponse
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken,
                User = userResponse,
                ExpiresAt = _jwtService.GetTokenExpiration(newAccessToken)
            };

            return ApiResponse<AuthResponse>.SuccessResult(authResponse, "Token refreshed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return ApiResponse<AuthResponse>.FailureResult("An error occurred during token refresh");
        }
    }

    public async Task<ApiResponse<bool>> LogoutAsync(Guid userId)
    {
        try
        {
            // Revoke all user's refresh tokens
            await _unitOfWork.RefreshTokens.RevokeAllUserTokensAsync(userId);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User logged out successfully: {UserId}", userId);
            return ApiResponse<bool>.SuccessResult(true, "Logout successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout: {UserId}", userId);
            return ApiResponse<bool>.FailureResult("An error occurred during logout");
        }
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        try
        {
            // Get user
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<bool>.FailureResult("User not found");
            }

            // Verify current password
            if (!_passwordService.VerifyPassword(currentPassword, user.PasswordHash))
            {
                return ApiResponse<bool>.FailureResult("Current password is incorrect");
            }

            // Validate new password
            if (!_passwordService.IsPasswordValid(newPassword))
            {
                return ApiResponse<bool>.FailureResult("New password does not meet requirements");
            }

            // Update password
            user.PasswordHash = _passwordService.HashPassword(newPassword);
            await _unitOfWork.Users.UpdateAsync(user);

            // Revoke all refresh tokens to force re-login
            await _unitOfWork.RefreshTokens.RevokeAllUserTokensAsync(userId);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
            return ApiResponse<bool>.SuccessResult(true, "Password changed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password change: {UserId}", userId);
            return ApiResponse<bool>.FailureResult("An error occurred during password change");
        }
    }

    public async Task<ApiResponse<bool>> ForgotPasswordAsync(string email)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
            {
                // Don't reveal that email doesn't exist for security reasons
                return ApiResponse<bool>.SuccessResult(true, "If the email exists, a password reset link has been sent");
            }

            // Generate reset token
            var resetToken = _passwordService.GenerateResetToken();
            
            // TODO: Store reset token with expiration (implement PasswordResetToken entity if needed)
            // TODO: Send email with reset link
            
            _logger.LogInformation("Password reset requested for user: {Email}", email);
            return ApiResponse<bool>.SuccessResult(true, "If the email exists, a password reset link has been sent");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset request: {Email}", email);
            return ApiResponse<bool>.FailureResult("An error occurred during password reset request");
        }
    }

    public async Task<ApiResponse<bool>> ResetPasswordAsync(string token, string newPassword)
    {
        try
        {
            // TODO: Implement password reset token validation
            // For now, return not implemented
            return ApiResponse<bool>.FailureResult("Password reset functionality not yet implemented");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset");
            return ApiResponse<bool>.FailureResult("An error occurred during password reset");
        }
    }

    private async Task<List<string>> ValidateRegistrationRequest(RegisterRequest request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.Email))
            errors.Add("Email is required");
        else if (!IsValidEmail(request.Email))
            errors.Add("Email format is invalid");

        if (string.IsNullOrWhiteSpace(request.Username))
            errors.Add("Username is required");
        else if (request.Username.Length < 3)
            errors.Add("Username must be at least 3 characters long");

        if (string.IsNullOrWhiteSpace(request.FirstName))
            errors.Add("First name is required");

        if (string.IsNullOrWhiteSpace(request.LastName))
            errors.Add("Last name is required");

        if (string.IsNullOrWhiteSpace(request.Password))
            errors.Add("Password is required");
        else if (!_passwordService.IsPasswordValid(request.Password))
            errors.Add("Password must be at least 8 characters long and contain uppercase, lowercase, digit, and special character");

        return errors;
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private static UserResponse MapToUserResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            ProfileImageUrl = user.ProfileImageUrl,
            Role = user.Role,
            DefaultReminderTime = user.DefaultReminderTime,
            PreferredCategories = user.PreferredCategories,
            DefaultStakeAmount = user.DefaultStakeAmount,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}