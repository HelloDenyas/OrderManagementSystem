using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using OrderManagement.Api.Dtos.Auth;
using OrderManagement.Api.Tests.Infrastructure;

namespace OrderManagement.Api.Tests.Integration;

public class AuthIntegrationTests(
    CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task Login_WithInvalidUsernameOrPassword_ReturnsSameGenericUnauthorizedResponse()
    {
        using var client = CreateClient();

        var invalidUsernameResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = "unknown-admin",
            password = CustomWebApplicationFactory.AdminPassword
        });
        var invalidPasswordResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = CustomWebApplicationFactory.AdminUsername,
            password = "WrongPassword123!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, invalidUsernameResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, invalidPasswordResponse.StatusCode);

        var invalidUsernameBody = await invalidUsernameResponse.Content.ReadAsStringAsync();
        var invalidPasswordBody = await invalidPasswordResponse.Content.ReadAsStringAsync();

        Assert.Equal(invalidUsernameBody, invalidPasswordBody);
        Assert.Contains("Invalid username or password.", invalidUsernameBody);
    }

    [Fact]
    public async Task Login_WithValidCredentials_SetsCookieAndAllowsCurrentUserRequest()
    {
        using var client = CreateClient();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = CustomWebApplicationFactory.AdminUsername,
            password = CustomWebApplicationFactory.AdminPassword
        });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        Assert.True(loginResponse.Headers.TryGetValues("Set-Cookie", out var cookieHeaders));
        Assert.Contains(cookieHeaders, header =>
            header.Contains("OrderManagement.Admin", StringComparison.Ordinal) &&
            header.Contains("httponly", StringComparison.OrdinalIgnoreCase));

        var meResponse = await client.GetAsync("/api/auth/me");
        var currentUser = await meResponse.Content.ReadFromJsonAsync<AuthUserResponse>();

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.NotNull(currentUser);
        Assert.Equal(CustomWebApplicationFactory.AdminUsername, currentUser.Username);
    }

    private HttpClient CreateClient()
    {
        return factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            HandleCookies = true
        });
    }
}
