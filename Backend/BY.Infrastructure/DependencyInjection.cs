using BY.Core.Interfaces;
using BY.Infrastructure.Data;
using BY.Infrastructure.Repositories;
using BY.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BY.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var useInMemory = configuration.GetValue<bool>("UseInMemoryDatabase", false);

        if (useInMemory)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb");
            });
        }
        else
        {
            // Add DbContext (PostgreSQL)
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                options.UseNpgsql(connectionString, b => b.MigrationsAssembly("BY.Infrastructure"));

                // Enable sensitive data logging in development
                var enableSensitiveLogging = configuration.GetValue<bool>("EnableSensitiveDataLogging", false);
                if (enableSensitiveLogging)
                {
                    options.EnableSensitiveDataLogging();
                }
            });
        }

        // Add repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IGoalRepository, GoalRepository>();
        services.AddScoped<ICheckInRepository, CheckInRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        
        // Add Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Add services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<IGoalService, GoalService>();

        return services;
    }
}