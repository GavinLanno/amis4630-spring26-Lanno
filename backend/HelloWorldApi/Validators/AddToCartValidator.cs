using FluentValidation;
using HelloWorldApi.DTOs;

namespace HelloWorldApi.Validators;

public class AddToCartValidator : AbstractValidator<AddToCartDto>
{
    public AddToCartValidator()
    {
        RuleFor(request => request.ListingId)
            .GreaterThan(0)
            .WithMessage("ListingId must be greater than 0.");

        RuleFor(request => request.Quantity)
            .InclusiveBetween(1, 99)
            .WithMessage("Quantity must be between 1 and 99.");
    }
}
