using FluentValidation;
using HelloWorldApi.DTOs;

namespace HelloWorldApi.Validators;

public class UpdateListingRequestValidator : AbstractValidator<UpdateListingRequestDto>
{
    public UpdateListingRequestValidator()
    {
        RuleFor(request => request.Address)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(request => request.Description)
            .NotEmpty()
            .MaximumLength(2000);

        RuleFor(request => request.Price)
            .InclusiveBetween(0.01m, 99999999.99m);

        RuleFor(request => request.CategoryId)
            .GreaterThan(0);

        RuleFor(request => request.SellerName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(request => request.ImageURL)
            .MaximumLength(500)
            .When(request => !string.IsNullOrWhiteSpace(request.ImageURL));
    }
}