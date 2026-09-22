using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Data;
using OrderManagement.Api.Dtos.Products;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(product =>
                EF.Functions.ILike(product.Name, pattern) ||
                EF.Functions.ILike(product.Category, pattern));
        }

        var products = await query
            .OrderBy(product => product.Name)
            .ToListAsync(cancellationToken);

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(
        int id,
        CancellationToken cancellationToken)
    {
        var product = await dbContext.Products
            .AsNoTracking()
            .SingleOrDefaultAsync(product => product.Id == id, cancellationToken);

        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(
        CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim();
        var category = request.Category?.Trim();

        if (!ValidateProductValues(name, category, request.Price, request.StockQuantity))
        {
            return ValidationProblem(ModelState);
        }

        var product = new Product
        {
            Name = name!,
            Price = request.Price.GetValueOrDefault(),
            StockQuantity = request.StockQuantity.GetValueOrDefault(),
            Category = category!
        };

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(
        int id,
        UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim();
        var category = request.Category?.Trim();

        if (!ValidateProductValues(name, category, request.Price, request.StockQuantity))
        {
            return ValidationProblem(ModelState);
        }

        var product = await dbContext.Products
            .SingleOrDefaultAsync(product => product.Id == id, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        product.Name = name!;
        product.Price = request.Price.GetValueOrDefault();
        product.StockQuantity = request.StockQuantity.GetValueOrDefault();
        product.Category = category!;

        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(
        int id,
        CancellationToken cancellationToken)
    {
        var product = await dbContext.Products
            .SingleOrDefaultAsync(product => product.Id == id, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        var isUsedInOrder = await dbContext.OrderItems
            .AnyAsync(orderItem => orderItem.ProductId == id, cancellationToken);

        if (isUsedInOrder)
        {
            return Conflict(new
            {
                message = "The product cannot be deleted because it is used in an order."
            });
        }

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private bool ValidateProductValues(
        string? name,
        string? category,
        decimal? price,
        int? stockQuantity)
    {
        if (string.IsNullOrEmpty(name))
        {
            ModelState.AddModelError(nameof(Product.Name), "Name is required and cannot contain only whitespace.");
        }

        if (string.IsNullOrEmpty(category))
        {
            ModelState.AddModelError(nameof(Product.Category), "Category is required and cannot contain only whitespace.");
        }

        if (price is null)
        {
            ModelState.AddModelError(nameof(Product.Price), "Price is required.");
        }
        else if (GetDecimalPlaces(price.Value) > 2)
        {
            ModelState.AddModelError(nameof(Product.Price), "Price cannot have more than two decimal places.");
        }

        if (stockQuantity is null)
        {
            ModelState.AddModelError(nameof(Product.StockQuantity), "Stock quantity is required.");
        }

        return ModelState.IsValid;
    }

    private static int GetDecimalPlaces(decimal value)
    {
        return (decimal.GetBits(value)[3] >> 16) & 0x7F;
    }
}
