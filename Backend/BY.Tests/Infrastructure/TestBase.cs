using BY.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BY.Tests.Infrastructure;

public abstract class TestBase : IDisposable
{
    protected ApplicationDbContext Context { get; private set; }

    protected TestBase()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        Context = new ApplicationDbContext(options);
        Context.Database.EnsureCreated();
    }

    protected async Task SeedTestDataAsync()
    {
        await Context.SaveChangesAsync();
    }

    public void Dispose()
    {
        Context?.Dispose();
    }
}