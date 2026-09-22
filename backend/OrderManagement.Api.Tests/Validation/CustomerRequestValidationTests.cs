using OrderManagement.Api.Dtos.Customers;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Tests.Validation;

public class CustomerRequestValidationTests
{
    [Theory]
    [InlineData("Jonas123")]
    [InlineData("12345")]
    [InlineData("Jonas@")]
    [InlineData("Test#Name")]
    public void CreateAndUpdateRequests_WithInvalidNameCharacters_AreInvalid(string name)
    {
        var createRequest = CreateRequest(name: name);
        var updateRequest = UpdateRequest(name: name);

        var createResults = ValidationTestHelper.Validate(createRequest);
        var updateResults = ValidationTestHelper.Validate(updateRequest);

        Assert.True(ValidationTestHelper.HasErrorFor(createResults, nameof(createRequest.Name)));
        Assert.True(ValidationTestHelper.HasErrorFor(updateResults, nameof(updateRequest.Name)));
    }

    [Theory]
    [InlineData("Jonas Jonaitis")]
    [InlineData("Žygimantas Žemaitis")]
    [InlineData("Jean-Pierre Dupont")]
    [InlineData("O'Connor")]
    [InlineData("Ana María")]
    public void CreateAndUpdateRequests_WithValidInternationalNames_AreValid(string name)
    {
        var createRequest = CreateRequest(name: name);
        var updateRequest = UpdateRequest(name: name);

        var createResults = ValidationTestHelper.Validate(createRequest);
        var updateResults = ValidationTestHelper.Validate(updateRequest);

        Assert.False(ValidationTestHelper.HasErrorFor(createResults, nameof(createRequest.Name)));
        Assert.False(ValidationTestHelper.HasErrorFor(updateResults, nameof(updateRequest.Name)));
    }

    [Theory]
    [InlineData("+370ABC123")]
    [InlineData("phone123")]
    [InlineData("+370@600")]
    public void CreateAndUpdateRequests_WithLettersOrInvalidPhoneSymbols_AreInvalid(string phone)
    {
        var createRequest = CreateRequest(phone: phone);
        var updateRequest = UpdateRequest(phone: phone);

        var createResults = ValidationTestHelper.Validate(createRequest);
        var updateResults = ValidationTestHelper.Validate(updateRequest);

        Assert.True(ValidationTestHelper.HasErrorFor(createResults, nameof(createRequest.Phone)));
        Assert.True(ValidationTestHelper.HasErrorFor(updateResults, nameof(updateRequest.Phone)));
    }

    [Theory]
    [InlineData("+37060000000")]
    [InlineData("+370 600 00000")]
    [InlineData("(370) 600-00000")]
    [InlineData("860000000")]
    public void CreateAndUpdateRequests_WithValidPhoneFormats_AreValid(string phone)
    {
        var createRequest = CreateRequest(phone: phone);
        var updateRequest = UpdateRequest(phone: phone);

        var createResults = ValidationTestHelper.Validate(createRequest);
        var updateResults = ValidationTestHelper.Validate(updateRequest);

        Assert.False(ValidationTestHelper.HasErrorFor(createResults, nameof(createRequest.Phone)));
        Assert.False(ValidationTestHelper.HasErrorFor(updateResults, nameof(updateRequest.Phone)));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateAndUpdateRequests_WithBlankOptionalPhone_AreValid(string? phone)
    {
        var createRequest = CreateRequest(phone: phone);
        var updateRequest = UpdateRequest(phone: phone);

        var createResults = ValidationTestHelper.Validate(createRequest);
        var updateResults = ValidationTestHelper.Validate(updateRequest);

        Assert.False(ValidationTestHelper.HasErrorFor(createResults, nameof(createRequest.Phone)));
        Assert.False(ValidationTestHelper.HasErrorFor(updateResults, nameof(updateRequest.Phone)));
    }

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

    private static CreateCustomerRequest CreateRequest(
        string name = "Customer",
        string? phone = null)
    {
        return new CreateCustomerRequest
        {
            Name = name,
            Email = "customer@example.com",
            Phone = phone
        };
    }

    private static UpdateCustomerRequest UpdateRequest(
        string name = "Customer",
        string? phone = null)
    {
        return new UpdateCustomerRequest
        {
            Name = name,
            Email = "customer@example.com",
            Phone = phone
        };
    }
}
