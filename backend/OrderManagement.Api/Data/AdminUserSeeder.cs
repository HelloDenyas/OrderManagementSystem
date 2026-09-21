using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Data;

public static class AdminUserSeeder
{
    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration configuration)
    {
        var configuredUsername = configuration["Admin:Username"];
        var configuredPassword = configuration["Admin:Password"];

        if (string.IsNullOrWhiteSpace(configuredUsername) ||
            string.IsNullOrWhiteSpace(configuredPassword))
        {
            return;
        }

        var username = configuredUsername.Trim();

        if (username.Length > AdminUser.MaxUsernameLength)
        {
            throw new InvalidOperationException(
                $"The configured admin username cannot exceed {AdminUser.MaxUsernameLength} characters.");
        }

        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (await dbContext.AdminUsers.AnyAsync())
        {
            return;
        }

        var passwordHasher = scope.ServiceProvider
            .GetRequiredService<IPasswordHasher<AdminUser>>();

        var adminUser = new AdminUser
        {
            Username = username
        };

        adminUser.PasswordHash = passwordHasher.HashPassword(
            adminUser,
            configuredPassword);

        dbContext.AdminUsers.Add(adminUser);
        await dbContext.SaveChangesAsync();
    }
}
