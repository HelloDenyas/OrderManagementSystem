using System.ComponentModel.DataAnnotations;

namespace OrderManagement.Api.Dtos.Orders;

public class UpdateOrderStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
