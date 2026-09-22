using System.ComponentModel.DataAnnotations;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Dtos.Customers;

public class UpdateCustomerRequest
{
    [Required]
    [MaxLength(Customer.MaxNameLength)]
    [RegularExpression(
        Customer.NamePattern,
        ErrorMessage = "Vardas gali būti sudarytas tik iš raidžių, tarpų, brūkšnelių ir apostrofų.")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(Customer.MaxEmailLength)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(Customer.MaxPhoneLength)]
    [RegularExpression(
        Customer.PhonePattern,
        ErrorMessage = "Telefono numeris gali turėti tik skaičius ir telefono numeriui įprastus simbolius.")]
    public string? Phone { get; set; }
}
