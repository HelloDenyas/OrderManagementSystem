using System.ComponentModel.DataAnnotations;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Dtos.Auth;

public class LoginRequest
{
    [Required]
    [MaxLength(AdminUser.MaxUsernameLength)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(AdminUser.MaxPasswordLength)]
    public string Password { get; set; } = string.Empty;
}
