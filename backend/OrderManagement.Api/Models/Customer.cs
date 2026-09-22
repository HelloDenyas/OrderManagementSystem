using System.ComponentModel.DataAnnotations;

namespace OrderManagement.Api.Models;

public class Customer
{
    public const int MaxNameLength = 200;
    public const int MaxEmailLength = 254;
    public const int MaxPhoneLength = 50;
    public const string NamePattern = @"^(?=.*\p{L})[\p{L}\p{M} '\u2019-]+$";
    public const string PhonePattern = @"^(?:\s*|\+?(?=[0-9 ()-]*[0-9])[0-9 ()-]+)$";

    public int Id { get; set; }

    [Required]
    [MaxLength(MaxNameLength)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(MaxEmailLength)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(MaxPhoneLength)]
    public string? Phone { get; set; }
}
