using System.ComponentModel.DataAnnotations;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Dtos.Customers;

public class UpdateCustomerRequest
{
    [Required]
    [MaxLength(Customer.MaxNameLength)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(Customer.MaxEmailLength)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(Customer.MaxPhoneLength)]
    public string? Phone { get; set; }
}
