using BY.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BY.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<HealthController> _logger;
    private static DateTime _lastDbCheck = DateTime.MinValue;
    private static string _lastDbStatus = "Unknown";
    private static readonly object _lockObject = new object();

    public HealthController(IUnitOfWork unitOfWork, ILogger<HealthController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Health check endpoint for Docker and load balancers
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Health()
    {
        var health = new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = GetType().Assembly.GetName().Version?.ToString(),
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            Checks = new
            {
                Database = await CheckDatabaseHealth(),
                Application = "OK"
            }
        };

        return Ok(health);
    }

    /// <summary>
    /// Detailed health check with dependencies
    /// </summary>
    [HttpGet("detailed")]
    public async Task<IActionResult> DetailedHealth()
    {
        var checks = new Dictionary<string, object>
        {
            { "timestamp", DateTime.UtcNow },
            { "version", GetType().Assembly.GetName().Version?.ToString() ?? "Unknown" },
            { "environment", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown" },
            { "database", await CheckDatabaseHealth() },
            { "memory", GetMemoryInfo() },
            { "uptime", GetUptime() }
        };

        var isHealthy = checks.Values.All(v => v?.ToString() != "Unhealthy");

        return isHealthy ? Ok(new { status = "Healthy", checks }) 
                        : StatusCode(503, new { status = "Unhealthy", checks });
    }

    private async Task<string> CheckDatabaseHealth()
    {
        // Cache database health check for 30 seconds to prevent spam
        lock (_lockObject)
        {
            if (DateTime.UtcNow - _lastDbCheck < TimeSpan.FromSeconds(30))
            {
                return _lastDbStatus;
            }
        }

        try
        {
            // Simple database connectivity check - just test connection, don't count
            await _unitOfWork.Users.GetFirstOrDefaultAsync(u => true);
            
            lock (_lockObject)
            {
                _lastDbCheck = DateTime.UtcNow;
                _lastDbStatus = "Healthy";
            }
            
            return "Healthy";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            
            lock (_lockObject)
            {
                _lastDbCheck = DateTime.UtcNow;
                _lastDbStatus = "Unhealthy";
            }
            
            return "Unhealthy";
        }
    }

    private object GetMemoryInfo()
    {
        var process = System.Diagnostics.Process.GetCurrentProcess();
        return new
        {
            WorkingSet = $"{process.WorkingSet64 / 1024 / 1024} MB",
            PrivateMemory = $"{process.PrivateMemorySize64 / 1024 / 1024} MB"
        };
    }

    private object GetUptime()
    {
        var process = System.Diagnostics.Process.GetCurrentProcess();
        var uptime = DateTime.Now - process.StartTime;
        return new
        {
            Days = uptime.Days,
            Hours = uptime.Hours,
            Minutes = uptime.Minutes,
            Seconds = uptime.Seconds
        };
    }
}