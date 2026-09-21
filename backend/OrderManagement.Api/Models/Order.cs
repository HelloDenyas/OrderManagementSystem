namespace OrderManagement.Api.Models;

public class Order
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public Customer Customer { get; set; } = null!;

    public OrderStatus Status { get; set; } = OrderStatus.Naujas;

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
