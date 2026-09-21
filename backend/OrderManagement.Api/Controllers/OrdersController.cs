using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Data;
using OrderManagement.Api.Dtos.Orders;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetOrders(
        CancellationToken cancellationToken)
    {
        var orders = await dbContext.Orders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.OrderItems)
                .ThenInclude(orderItem => orderItem.Product)
            .OrderByDescending(order => order.CreatedAtUtc)
            .ThenByDescending(order => order.Id)
            .ToListAsync(cancellationToken);

        return Ok(orders.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetOrder(
        int id,
        CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.OrderItems)
                .ThenInclude(orderItem => orderItem.Product)
            .SingleOrDefaultAsync(order => order.Id == id, cancellationToken);

        return order is null ? NotFound() : Ok(ToResponse(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder(
        CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Items is null || request.Items.Count == 0)
        {
            ModelState.AddModelError(nameof(request.Items), "At least one product item is required.");
            return ValidationProblem(ModelState);
        }

        if (request.Items.Any(item => item.Quantity <= 0))
        {
            ModelState.AddModelError(nameof(request.Items), "Every quantity must be greater than 0.");
        }

        var productIds = request.Items
            .Select(item => item.ProductId)
            .ToList();

        if (productIds.Distinct().Count() != productIds.Count)
        {
            ModelState.AddModelError(nameof(request.Items), "Duplicate products are not allowed in one order.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var customer = await dbContext.Customers
            .AsNoTracking()
            .SingleOrDefaultAsync(customer => customer.Id == request.CustomerId, cancellationToken);

        if (customer is null)
        {
            ModelState.AddModelError(nameof(request.CustomerId), "The selected customer does not exist.");
            return ValidationProblem(ModelState);
        }

        var products = await dbContext.Products
            .AsNoTracking()
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id, cancellationToken);

        var missingProductIds = productIds
            .Where(productId => !products.ContainsKey(productId))
            .Distinct()
            .ToList();

        if (missingProductIds.Count > 0)
        {
            ModelState.AddModelError(
                nameof(request.Items),
                $"Products with IDs {string.Join(", ", missingProductIds)} do not exist.");
            return ValidationProblem(ModelState);
        }

        var orderItems = request.Items
            .Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = products[item.ProductId].Price
            })
            .ToList();

        var order = new Order
        {
            CustomerId = customer.Id,
            Status = OrderStatus.Naujas,
            CreatedAtUtc = DateTime.UtcNow,
            OrderItems = orderItems,
            TotalAmount = orderItems.Sum(item => item.UnitPrice * item.Quantity)
        };

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new OrderResponse
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = customer.Name,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            CreatedAtUtc = order.CreatedAtUtc,
            Items = order.OrderItems.Select(orderItem => new OrderItemResponse
            {
                ProductId = orderItem.ProductId,
                ProductName = products[orderItem.ProductId].Name,
                Quantity = orderItem.Quantity,
                UnitPrice = orderItem.UnitPrice,
                LineTotal = orderItem.UnitPrice * orderItem.Quantity
            }).ToList()
        };

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, response);
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<OrderStatusResponse>> UpdateOrderStatus(
        int id,
        UpdateOrderStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryParseStatus(request.Status, out var status))
        {
            ModelState.AddModelError(
                nameof(request.Status),
                "Status must be one of: Naujas, Vykdomas, Įvykdytas, Atšauktas.");
            return ValidationProblem(ModelState);
        }

        var order = await dbContext.Orders
            .SingleOrDefaultAsync(order => order.Id == id, cancellationToken);

        if (order is null)
        {
            return NotFound();
        }

        order.Status = status;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new OrderStatusResponse
        {
            Id = order.Id,
            Status = order.Status.ToString()
        });
    }

    private static OrderResponse ToResponse(Order order)
    {
        return new OrderResponse
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = order.Customer.Name,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            CreatedAtUtc = order.CreatedAtUtc,
            Items = order.OrderItems
                .OrderBy(orderItem => orderItem.Id)
                .Select(orderItem => new OrderItemResponse
                {
                    ProductId = orderItem.ProductId,
                    ProductName = orderItem.Product.Name,
                    Quantity = orderItem.Quantity,
                    UnitPrice = orderItem.UnitPrice,
                    LineTotal = orderItem.UnitPrice * orderItem.Quantity
                })
                .ToList()
        };
    }

    private static bool TryParseStatus(string? value, out OrderStatus status)
    {
        var requestedStatus = value?.Trim();

        foreach (var allowedStatus in Enum.GetValues<OrderStatus>())
        {
            if (string.Equals(
                requestedStatus,
                allowedStatus.ToString(),
                StringComparison.OrdinalIgnoreCase))
            {
                status = allowedStatus;
                return true;
            }
        }

        status = default;
        return false;
    }
}
