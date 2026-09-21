using System.ComponentModel.DataAnnotations;

namespace OrderManagement.Api.Dtos.Orders;

public class CreateOrderItemRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
