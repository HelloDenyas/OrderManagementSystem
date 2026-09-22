using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Api.Models;
using OrderManagement.Api.Tests.Infrastructure;

namespace OrderManagement.Api.Tests.Integration;

public class OrderIntegrationTests(
    CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task CreateOrder_WhenQuantityExceedsStock_ReturnsBadRequestAndPersistsNothing()
    {
        await factory.ResetDatabaseAsync();
        var ids = await SeedCustomerAndProductAsync(stockQuantity: 3);
        using var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/orders", new
        {
            customerId = ids.CustomerId,
            items = new[]
            {
                new { productId = ids.ProductId, quantity = 4 }
            }
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var counts = await GetOrderCountsAsync();
        Assert.Equal(0, counts.OrderCount);
        Assert.Equal(0, counts.OrderItemCount);
    }

    [Fact]
    public async Task CreateOrder_UsesDatabasePricesAndCalculatesTotalOnServer()
    {
        await factory.ResetDatabaseAsync();
        var ids = await factory.ExecuteDbContextAsync(async dbContext =>
        {
            var customer = TestData.CreateCustomer();
            var firstProduct = TestData.CreateProduct("First Product", 10.25m, 10);
            var secondProduct = TestData.CreateProduct("Second Product", 4.50m, 8);

            dbContext.AddRange(customer, firstProduct, secondProduct);
            await dbContext.SaveChangesAsync();

            return (
                CustomerId: customer.Id,
                FirstProductId: firstProduct.Id,
                SecondProductId: secondProduct.Id);
        });
        using var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/orders", new
        {
            customerId = ids.CustomerId,
            items = new[]
            {
                new { productId = ids.FirstProductId, quantity = 2 },
                new { productId = ids.SecondProductId, quantity = 3 }
            }
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var persistedOrder = await factory.ExecuteDbContextAsync(async dbContext =>
        {
            var order = await dbContext.Orders
                .AsNoTracking()
                .Include(savedOrder => savedOrder.OrderItems)
                .SingleAsync();
            var stocks = await dbContext.Products
                .AsNoTracking()
                .ToDictionaryAsync(product => product.Id, product => product.StockQuantity);

            return new
            {
                order.TotalAmount,
                Items = order.OrderItems.ToDictionary(
                    item => item.ProductId,
                    item => (item.Quantity, item.UnitPrice)),
                Stocks = stocks
            };
        });

        Assert.Equal(34.00m, persistedOrder.TotalAmount);
        Assert.Equal((2, 10.25m), persistedOrder.Items[ids.FirstProductId]);
        Assert.Equal((3, 4.50m), persistedOrder.Items[ids.SecondProductId]);
        Assert.Equal(10, persistedOrder.Stocks[ids.FirstProductId]);
        Assert.Equal(8, persistedOrder.Stocks[ids.SecondProductId]);
    }

    [Fact]
    public async Task CreateOrder_WithUnknownCustomer_ReturnsBadRequestAndPersistsNothing()
    {
        await factory.ResetDatabaseAsync();
        var productId = await factory.ExecuteDbContextAsync(async dbContext =>
        {
            var product = TestData.CreateProduct();
            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync();
            return product.Id;
        });
        using var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/orders", new
        {
            customerId = 999_999,
            items = new[]
            {
                new { productId, quantity = 1 }
            }
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal((0, 0), await GetOrderCountsAsync());
    }

    [Fact]
    public async Task CreateOrder_WithUnknownProduct_ReturnsBadRequestAndPersistsNothing()
    {
        await factory.ResetDatabaseAsync();
        var customerId = await factory.ExecuteDbContextAsync(async dbContext =>
        {
            var customer = TestData.CreateCustomer();
            dbContext.Customers.Add(customer);
            await dbContext.SaveChangesAsync();
            return customer.Id;
        });
        using var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/orders", new
        {
            customerId,
            items = new[]
            {
                new { productId = 999_999, quantity = 1 }
            }
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal((0, 0), await GetOrderCountsAsync());
    }

    private Task<(int CustomerId, int ProductId)> SeedCustomerAndProductAsync(
        int stockQuantity)
    {
        return factory.ExecuteDbContextAsync(async dbContext =>
        {
            var customer = TestData.CreateCustomer();
            var product = TestData.CreateProduct(stockQuantity: stockQuantity);

            dbContext.AddRange(customer, product);
            await dbContext.SaveChangesAsync();

            return (customer.Id, product.Id);
        });
    }

    private Task<(int OrderCount, int OrderItemCount)> GetOrderCountsAsync()
    {
        return factory.ExecuteDbContextAsync(async dbContext =>
            (await dbContext.Orders.CountAsync(), await dbContext.OrderItems.CountAsync()));
    }
}
