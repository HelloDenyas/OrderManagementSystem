using OrderManagement.Api.Models;

namespace OrderManagement.Api.Tests.Infrastructure;

public static class TestData
{
    public static Customer CreateCustomer(string name = "Test Customer")
    {
        return new Customer
        {
            Name = name,
            Email = "customer@example.com",
            Phone = null
        };
    }

    public static Product CreateProduct(
        string name = "Test Product",
        decimal price = 10.00m,
        int stockQuantity = 10)
    {
        return new Product
        {
            Name = name,
            Price = price,
            StockQuantity = stockQuantity,
            Category = "Test Category"
        };
    }
}
