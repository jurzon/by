using System.Net;
using System.Net.Http.Json;
using BY.Core.DTOs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace BY.Tests.Integration;

public class AuthEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthEndpointsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    [Fact]
    public async Task Register_Should_Create_User_And_Return_Token()
    {
        var request = new RegisterRequest
        {
            Email = $"test_{Guid.NewGuid():N}@example.com",
            Username = $"user_{Guid.NewGuid():N}".Substring(0,12),
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };

        var response = await _client.PostAsJsonAsync("/api/v1/Auth/register", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
        result!.Success.Should().BeTrue();
        result.Data!.Token.Should().NotBeNullOrWhiteSpace();
        result.Data.User.Email.Should().Be(request.Email);
    }

    [Fact]
    public async Task Login_With_Invalid_Credentials_Should_Fail()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Auth/login", new LoginRequest
        {
            Email = "not_exists@example.com",
            Password = "BadPass123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
