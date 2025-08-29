using BY.Core.DTOs;
using BY.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BY.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Register endpoint");
            return StatusCode(500, ApiResponse<AuthResponse>.FailureResult("Internal server error"));
        }
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Login endpoint");
            return StatusCode(500, ApiResponse<AuthResponse>.FailureResult("Internal server error"));
        }
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in RefreshToken endpoint");
            return StatusCode(500, ApiResponse<AuthResponse>.FailureResult("Internal server error"));
        }
    }

    /// <summary>
    /// Logout and revoke refresh tokens
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("Invalid user"));
            }

            var result = await _authService.LogoutAsync(userId.Value);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Logout endpoint");
            return StatusCode(500, ApiResponse<bool>.FailureResult("Internal server error"));
        }
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("Invalid user"));
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(ApiResponse<bool>.FailureResult("Passwords do not match"));
            }

            var result = await _authService.ChangePasswordAsync(userId.Value, request.CurrentPassword, request.NewPassword);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ChangePassword endpoint");
            return StatusCode(500, ApiResponse<bool>.FailureResult("Internal server error"));
        }
    }

    /// <summary>
    /// Request password reset
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            var result = await _authService.ForgotPasswordAsync(request.Email);
            
            // Always return success for security reasons
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ForgotPassword endpoint");
            return StatusCode(500, ApiResponse<bool>.FailureResult("Internal server error"));
        }
    }

    /// <summary>
    /// Reset password using reset token
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(ApiResponse<bool>.FailureResult("Passwords do not match"));
            }

            var result = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ResetPassword endpoint");
            return StatusCode(500, ApiResponse<bool>.FailureResult("Internal server error"));
        }
    }

    /// <summary>
    /// Get current user information (test endpoint for authentication)
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        try
        {
            var userId = GetCurrentUserId();
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userId == null)
            {
                return Unauthorized(ApiResponse<object>.FailureResult("Invalid user"));
            }

            var userInfo = new
            {
                UserId = userId,
                Email = userEmail,
                Role = userRole,
                Claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            };

            return Ok(ApiResponse<object>.SuccessResult(userInfo, "User information retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetCurrentUser endpoint");
            return StatusCode(500, ApiResponse<object>.FailureResult("Internal server error"));
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }
}