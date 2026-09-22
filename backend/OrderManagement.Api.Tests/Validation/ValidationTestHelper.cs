using System.ComponentModel.DataAnnotations;

namespace OrderManagement.Api.Tests.Validation;

internal static class ValidationTestHelper
{
    public static IReadOnlyList<ValidationResult> Validate(object model)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(
            model,
            new ValidationContext(model),
            results,
            validateAllProperties: true);

        return results;
    }

    public static bool HasErrorFor(
        IReadOnlyList<ValidationResult> results,
        string propertyName)
    {
        return results.Any(result => result.MemberNames.Contains(propertyName));
    }
}
