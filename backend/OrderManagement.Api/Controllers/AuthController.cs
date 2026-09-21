using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Data;
using OrderManagement.Api.Dtos.Auth;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    AppDbContext dbContext,
    IPasswordHasher<AdminUser> passwordHasher) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthUserResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var username = request.Username?.Trim();

        if (string.IsNullOrEmpty(username))
        {
            ModelState.AddModelError(nameof(request.Username), "Username is required.");
            return ValidationProblem(ModelState);
        }

        var adminUser = await dbContext.AdminUsers
            .SingleOrDefaultAsync(
                adminUser => adminUser.Username == username,
                cancellationToken);

        if (adminUser is null)
        {
            return InvalidCredentials();
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(
            adminUser,
            adminUser.PasswordHash,
            request.Password);

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return InvalidCredentials();
        }

        if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, request.Password);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, adminUser.Id.ToString()),
            new Claim(ClaimTypes.Name, adminUser.Username)
        };

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties
            {
                IsPersistent = false,
                AllowRefresh = true
            });

        return Ok(new AuthUserResponse
        {
            Username = adminUser.Username
        });
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<AuthUserResponse> Me()
    {
        var username = User.Identity?.Name;

        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized();
        }

        return Ok(new AuthUserResponse
        {
            Username = username
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme);

        return NoContent();
    }

    private UnauthorizedObjectResult InvalidCredentials()
    {
        return Unauthorized(new
        {
            message = "Invalid username or password."
        });
    }
}
