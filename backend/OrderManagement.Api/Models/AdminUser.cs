using System.ComponentModel.DataAnnotations;

namespace OrderManagement.Api.Models;

public class AdminUser
{
    public const int MaxUsernameLength = 100;
    public const int MaxPasswordLength = 128;
    public const int MaxPasswordHashLength = 512;

    public int Id { get; set; }

    [Required]
    [MaxLength(MaxUsernameLength)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(MaxPasswordHashLength)]
    public string PasswordHash { get; set; } = string.Empty;
}
