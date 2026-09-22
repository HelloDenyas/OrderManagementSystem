using System.ComponentModel.DataAnnotations;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Dtos.Products;

public class UpdateProductRequest
{
    [Required]
    [MaxLength(Product.MaxNameLength)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int? StockQuantity { get; set; }

    [Required]
    [MaxLength(Product.MaxCategoryLength)]
    public string Category { get; set; } = string.Empty;
}
