using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Data;
using OrderManagement.Api.Dtos.Products;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Controllers;

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

        if (!ValidateRequiredText(name, category))
        {
            return ValidationProblem(ModelState);
        }

        var product = new Product
        {
            Name = name!,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
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

        if (!ValidateRequiredText(name, category))
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
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
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

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private bool ValidateRequiredText(string? name, string? category)
    {
        if (string.IsNullOrEmpty(name))
        {
            ModelState.AddModelError(nameof(Product.Name), "Name is required and cannot contain only whitespace.");
        }

        if (string.IsNullOrEmpty(category))
        {
            ModelState.AddModelError(nameof(Product.Category), "Category is required and cannot contain only whitespace.");
        }

        return ModelState.IsValid;
    }
}
