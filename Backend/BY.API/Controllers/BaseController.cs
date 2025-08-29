using BY.Core.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BY.API.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }

    protected string? GetCurrentUserEmail()
    {
        return User.FindFirst(ClaimTypes.Email)?.Value;
    }

    protected string? GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value;
    }

    protected bool IsCurrentUserAdmin()
    {
        return GetCurrentUserRole()?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true;
    }

    protected IActionResult HandleServiceResponse<T>(ApiResponse<T> response)
    {
        if (response.Success)
        {
            return Ok(response);
        }

        // Determine status code based on error content
        if (response.Message?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
        {
            return NotFound(response);
        }

        if (response.Message?.Contains("unauthorized", StringComparison.OrdinalIgnoreCase) == true ||
            response.Message?.Contains("forbidden", StringComparison.OrdinalIgnoreCase) == true)
        {
            return Forbid();
        }

        return BadRequest(response);
    }

    protected IActionResult InternalServerError<T>(string message = "Internal server error")
    {
        return StatusCode(500, ApiResponse<T>.FailureResult(message));
    }
}