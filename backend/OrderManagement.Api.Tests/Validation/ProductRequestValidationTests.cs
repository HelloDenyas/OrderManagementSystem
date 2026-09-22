using OrderManagement.Api.Dtos.Products;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Tests.Validation;

public class ProductRequestValidationTests
{
    [Fact]
    public void CreateRequest_WithoutPrice_IsInvalid()
    {
        var request = CreateValidRequest();
        request.Price = null;

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Price)));
    }

    [Fact]
    public void CreateRequest_WithoutStockQuantity_IsInvalid()
    {
        var request = CreateValidRequest();
        request.StockQuantity = null;

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.StockQuantity)));
    }

    [Fact]
    public void CreateRequest_WithNegativePrice_IsInvalid()
    {
        var request = CreateValidRequest();
        request.Price = -0.01m;

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Price)));
    }

    [Fact]
    public void CreateRequest_WithNegativeStockQuantity_IsInvalid()
    {
        var request = CreateValidRequest();
        request.StockQuantity = -1;

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.StockQuantity)));
    }

    [Fact]
    public void CreateRequest_WithTextOverMaximumLengths_IsInvalid()
    {
        var request = CreateValidRequest();
        request.Name = new string('N', Product.MaxNameLength + 1);
        request.Category = new string('C', Product.MaxCategoryLength + 1);

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Name)));
        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Category)));
    }

    private static CreateProductRequest CreateValidRequest()
    {
        return new CreateProductRequest
        {
            Name = "Product",
            Price = 10.00m,
            StockQuantity = 5,
            Category = "Category"
        };
    }
}
