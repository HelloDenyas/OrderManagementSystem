using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Tests.Infrastructure;

namespace OrderManagement.Api.Tests.Integration;

public class ProductIntegrationTests(
    CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task CreateProduct_WithoutPrice_ReturnsBadRequestAndDoesNotPersist()
    {
        await factory.ResetDatabaseAsync();
        using var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/products", new
        {
            name = "Product",
            stockQuantity = 5,
            category = "Category"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(0, await GetProductCountAsync());
    }

    [Fact]
    public async Task CreateProduct_WithoutStockQuantity_ReturnsBadRequestAndDoesNotPersist()
    {
        await factory.ResetDatabaseAsync();
        using var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/products", new
        {
            name = "Product",
            price = 10.00m,
            category = "Category"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(0, await GetProductCountAsync());
    }

    [Fact]
    public async Task CreateProduct_WithMoreThanTwoDecimalPlaces_ReturnsBadRequestAndDoesNotPersist()
    {
        await factory.ResetDatabaseAsync();
        using var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/products", new
        {
            name = "Product",
            price = 10.123m,
            stockQuantity = 5,
            category = "Category"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(0, await GetProductCountAsync());
    }

    [Theory]
    [InlineData(0.0)]
    [InlineData(12.34)]
    public async Task CreateProduct_WithValidPrice_ReturnsCreatedAndPersists(double price)
    {
        await factory.ResetDatabaseAsync();
        using var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/products", new
        {
            name = "Product",
            price,
            stockQuantity = 5,
            category = "Category"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var persistedPrice = await factory.ExecuteDbContextAsync(async dbContext =>
            await dbContext.Products
                .AsNoTracking()
                .Select(product => product.Price)
                .SingleAsync());

        Assert.Equal(Convert.ToDecimal(price), persistedPrice);
    }

    private Task<int> GetProductCountAsync()
    {
        return factory.ExecuteDbContextAsync(dbContext =>
            dbContext.Products.CountAsync());
    }
}
