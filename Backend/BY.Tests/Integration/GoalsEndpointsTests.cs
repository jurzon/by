using System.Net;
using System.Net.Http.Json;
using BY.Core.DTOs;
using BY.Core.Enums;
using FluentAssertions;
using Xunit;

namespace BY.Tests.Integration;

public class GoalsEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public GoalsEndpointsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterAndGetToken()
    {
        var register = new RegisterRequest
        {
            Email = $"goal_{Guid.NewGuid():N}@example.com",
            Username = $"goal_{Guid.NewGuid():N}".Substring(0,12),
            Password = "SecurePass123!",
            FirstName = "Goal",
            LastName = "User"
        };
        var regResp = await _client.PostAsJsonAsync("/api/v1/Auth/register", register);
        regResp.EnsureSuccessStatusCode();
        var regResult = await regResp.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
        return regResult!.Data!.Token;
    }

    [Fact]
    public async Task CreateGoal_Then_Get_List_Should_Succeed()
    {
        var token = await RegisterAndGetToken();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var create = new CreateGoalRequest
        {
            Title = "Read book",
            Description = "Read 20 pages",
            Category = GoalCategory.Learning,
            DurationDays = 7,
            TotalStakeAmount = 14,
            ReminderTime = new TimeOnly(20,0),
            ReminderMessage = "Read now"
        };

        var createResp = await _client.PostAsJsonAsync("/api/v1/Goals", create);
        createResp.StatusCode.Should().Be(HttpStatusCode.OK);
        var createResult = await createResp.Content.ReadFromJsonAsync<ApiResponse<GoalResponse>>();
        createResult!.Success.Should().BeTrue();
        createResult.Data!.Title.Should().Be(create.Title);

        var listResp = await _client.GetAsync("/api/v1/Goals");
        listResp.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await listResp.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<GoalResponse>>>();
        list!.Success.Should().BeTrue();
        list.Data!.Should().Contain(g => g.Title == create.Title);
    }
}
