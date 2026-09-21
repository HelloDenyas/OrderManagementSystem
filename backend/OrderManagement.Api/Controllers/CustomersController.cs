using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Data;
using OrderManagement.Api.Dtos.Customers;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Customers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(customer =>
                EF.Functions.ILike(customer.Name, pattern) ||
                EF.Functions.ILike(customer.Email, pattern));
        }

        var customers = await query
            .OrderBy(customer => customer.Name)
            .ToListAsync(cancellationToken);

        return Ok(customers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Customer>> GetCustomer(
        int id,
        CancellationToken cancellationToken)
    {
        var customer = await dbContext.Customers
            .AsNoTracking()
            .SingleOrDefaultAsync(customer => customer.Id == id, cancellationToken);

        return customer is null ? NotFound() : Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer(
        CreateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            ModelState.AddModelError(nameof(request.Name), "Name is required and cannot contain only whitespace.");
            return ValidationProblem(ModelState);
        }

        var customer = new Customer
        {
            Name = name,
            Email = request.Email.Trim(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim()
        };

        dbContext.Customers.Add(customer);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCustomer(
        int id,
        UpdateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            ModelState.AddModelError(nameof(request.Name), "Name is required and cannot contain only whitespace.");
            return ValidationProblem(ModelState);
        }

        var customer = await dbContext.Customers
            .SingleOrDefaultAsync(customer => customer.Id == id, cancellationToken);

        if (customer is null)
        {
            return NotFound();
        }

        customer.Name = name;
        customer.Email = request.Email.Trim();
        customer.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCustomer(
        int id,
        CancellationToken cancellationToken)
    {
        var customer = await dbContext.Customers
            .SingleOrDefaultAsync(customer => customer.Id == id, cancellationToken);

        if (customer is null)
        {
            return NotFound();
        }

        var isUsedInOrder = await dbContext.Orders
            .AnyAsync(order => order.CustomerId == id, cancellationToken);

        if (isUsedInOrder)
        {
            return Conflict(new
            {
                message = "The customer cannot be deleted because it is used in an order."
            });
        }

        dbContext.Customers.Remove(customer);
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
