using System.ComponentModel.DataAnnotations;

namespace OrderManagement.Api.Dtos.Orders;

public class CreateOrderRequest
{
    [Range(1, int.MaxValue)]
    public int CustomerId { get; set; }

    [Required]
    [MinLength(1)]
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}
