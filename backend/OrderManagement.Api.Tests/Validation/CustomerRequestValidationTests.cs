using OrderManagement.Api.Dtos.Customers;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Tests.Validation;

public class CustomerRequestValidationTests
{
    [Fact]
    public void CreateRequest_WithWhitespaceName_IsInvalid()
    {
        var request = new CreateCustomerRequest
        {
            Name = "   ",
            Email = "customer@example.com"
        };

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Name)));
    }

    [Fact]
    public void CreateRequest_WithInvalidEmail_IsInvalid()
    {
        var request = new CreateCustomerRequest
        {
            Name = "Customer",
            Email = "not-an-email"
        };

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Email)));
    }

    [Fact]
    public void CreateRequest_WithFieldsOverMaximumLengths_IsInvalid()
    {
        const string emailDomain = "@example.com";
        var request = new CreateCustomerRequest
        {
            Name = new string('N', Customer.MaxNameLength + 1),
            Email = $"{new string('e', Customer.MaxEmailLength + 1 - emailDomain.Length)}{emailDomain}",
            Phone = new string('1', Customer.MaxPhoneLength + 1)
        };

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Name)));
        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Email)));
        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Phone)));
    }
}
