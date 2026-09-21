using System.ComponentModel.DataAnnotations;

namespace OrderManagement.Api.Models;

public class Product
{
    public const int MaxNameLength = 200;
    public const int MaxCategoryLength = 100;

    public int Id { get; set; }

    [Required]
    [MaxLength(MaxNameLength)]
    public string Name { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [Required]
    [MaxLength(MaxCategoryLength)]
    public string Category { get; set; } = string.Empty;
}
