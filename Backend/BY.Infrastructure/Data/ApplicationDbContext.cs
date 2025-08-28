using BY.Core.Entities;
using BY.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace BY.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<Goal> Goals { get; set; }
    public DbSet<CheckIn> CheckIns { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<UserPreferences> UserPreferences { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Community> Communities { get; set; }
    public DbSet<CommunityMember> CommunityMembers { get; set; }
    public DbSet<CommunityPost> CommunityPosts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
            
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            
            entity.Property(e => e.DefaultStakeAmount).HasPrecision(10, 2);
            
            // Configure enum array
            entity.Property(e => e.PreferredCategories)
                .HasConversion(
                    v => string.Join(',', v.Select(e => e.ToString())),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(e => Enum.Parse<GoalCategory>(e)).ToArray());

            // Configure TimeOnly
            entity.Property(e => e.DefaultReminderTime)
                .HasConversion<TimeOnlyConverter, TimeOnlyComparer>();

            // Relationships
            entity.HasMany(e => e.Goals)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Payments)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Preferences)
                .WithOne(e => e.User)
                .HasForeignKey<UserPreferences>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Goal entity
        modelBuilder.Entity<Goal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.Status });
            entity.HasIndex(e => e.EndDate);
            
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.TotalStakeAmount).HasPrecision(10, 2);
            entity.Property(e => e.DailyStakeAmount).HasPrecision(10, 2);
            entity.Property(e => e.TotalPaid).HasPrecision(10, 2);
            entity.Property(e => e.ReminderMessage).HasMaxLength(500);

            // Configure TimeOnly
            entity.Property(e => e.ReminderTime)
                .HasConversion<TimeOnlyConverter, TimeOnlyComparer>();

            // Relationships
            entity.HasMany(e => e.CheckIns)
                .WithOne(e => e.Goal)
                .HasForeignKey(e => e.GoalId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Payments)
                .WithOne(e => e.Goal)
                .HasForeignKey(e => e.GoalId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure CheckIn entity
        modelBuilder.Entity<CheckIn>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.GoalId, e.Date }).IsUnique();
            entity.HasIndex(e => e.Date);
            
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.AmountCharged).HasPrecision(10, 2);

            // Configure DateOnly
            entity.Property(e => e.Date)
                .HasConversion<DateOnlyConverter, DateOnlyComparer>();

            // Relationships
            entity.HasOne(e => e.Payment)
                .WithOne(e => e.CheckIn)
                .HasForeignKey<CheckIn>(e => e.PaymentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure Payment entity
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.Type });
            entity.HasIndex(e => e.CreatedAt);
            
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.ExternalTransactionId).HasMaxLength(255);
            entity.Property(e => e.PaymentMethodId).HasMaxLength(255);
            entity.Property(e => e.StripePaymentIntentId).HasMaxLength(255);
            entity.Property(e => e.FailureReason).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.CharityName).HasMaxLength(200);
            entity.Property(e => e.CharityId).HasMaxLength(100);
        });

        // Configure UserPreferences entity
        modelBuilder.Entity<UserPreferences>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            
            entity.Property(e => e.PreferredStakeAmount).HasPrecision(10, 2);
            entity.Property(e => e.Timezone).HasMaxLength(50);
            entity.Property(e => e.Currency).HasMaxLength(3);

            // Configure TimeOnly properties
            entity.Property(e => e.QuietHoursStart)
                .HasConversion<TimeOnlyConverter, TimeOnlyComparer>();
            entity.Property(e => e.QuietHoursEnd)
                .HasConversion<TimeOnlyConverter, TimeOnlyComparer>();
            entity.Property(e => e.PreferredReminderTime)
                .HasConversion<TimeOnlyConverter, TimeOnlyComparer>();

            // Configure enum array
            entity.Property(e => e.FavoriteCategories)
                .HasConversion(
                    v => string.Join(',', v.Select(e => e.ToString())),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(e => Enum.Parse<GoalCategory>(e)).ToArray());
        });

        // Configure RefreshToken entity
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.IsRevoked });
            entity.HasIndex(e => e.ExpiresAt);
            
            entity.Property(e => e.Token).IsRequired().HasMaxLength(128);
            entity.Property(e => e.DeviceInfo).HasMaxLength(200);
            entity.Property(e => e.IpAddress).HasMaxLength(45); // IPv6 max length

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Community entities
        modelBuilder.Entity<Community>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CommunityMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.CommunityId, e.UserId }).IsUnique();
            entity.Property(e => e.Role).HasMaxLength(50);

            entity.HasOne(e => e.Community)
                .WithMany(e => e.Members)
                .HasForeignKey(e => e.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CommunityPost>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(1000);

            entity.HasOne(e => e.Community)
                .WithMany(e => e.Posts)
                .HasForeignKey(e => e.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Goal)
                .WithMany()
                .HasForeignKey(e => e.GoalId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure automatic timestamps
        ConfigureTimestamps(modelBuilder);
    }

    private void ConfigureTimestamps(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                entityType.FindProperty(nameof(BaseEntity.CreatedAt))
                    ?.SetDefaultValueSql("CURRENT_TIMESTAMP");
                
                entityType.FindProperty(nameof(BaseEntity.UpdatedAt))
                    ?.SetDefaultValueSql("CURRENT_TIMESTAMP");
            }
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}

// Custom converters for DateOnly and TimeOnly
public class DateOnlyConverter : ValueConverter<DateOnly, DateTime>
{
    public DateOnlyConverter() : base(
        dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
        dateTime => DateOnly.FromDateTime(dateTime))
    {
    }
}

public class DateOnlyComparer : ValueComparer<DateOnly>
{
    public DateOnlyComparer() : base(
        (d1, d2) => d1 == d2,
        d => d.GetHashCode())
    {
    }
}

public class TimeOnlyConverter : ValueConverter<TimeOnly, TimeSpan>
{
    public TimeOnlyConverter() : base(
        timeOnly => timeOnly.ToTimeSpan(),
        timeSpan => TimeOnly.FromTimeSpan(timeSpan))
    {
    }
}

public class TimeOnlyComparer : ValueComparer<TimeOnly>
{
    public TimeOnlyComparer() : base(
        (t1, t2) => t1 == t2,
        t => t.GetHashCode())
    {
    }
}