using OrderManagement.Api.Dtos.Auth;
using OrderManagement.Api.Models;

namespace OrderManagement.Api.Tests.Validation;

public class LoginRequestValidationTests
{
    [Fact]
    public void Request_WithoutUsernameAndPassword_IsInvalid()
    {
        var request = new LoginRequest();

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Username)));
        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Password)));
    }

    [Fact]
    public void Request_WithUsernameOverMaximumLength_IsInvalid()
    {
        var request = CreateValidRequest();
        request.Username = new string('u', AdminUser.MaxUsernameLength + 1);

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Username)));
    }

    [Fact]
    public void Request_WithPasswordOverMaximumLength_IsInvalid()
    {
        var request = CreateValidRequest();
        request.Password = new string('p', AdminUser.MaxPasswordLength + 1);

        var results = ValidationTestHelper.Validate(request);

        Assert.True(ValidationTestHelper.HasErrorFor(results, nameof(request.Password)));
    }

    private static LoginRequest CreateValidRequest()
    {
        return new LoginRequest
        {
            Username = "admin",
            Password = "password"
        };
    }
}
