using FluentValidation;
using HelloWorldApi.DTOs;

namespace HelloWorldApi.Validators;

public class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatusRequestDto>
{
    private static readonly string[] AllowedStatuses =
    [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    public UpdateOrderStatusValidator()
    {
        RuleFor(request => request.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => AllowedStatuses.Any(allowed =>
                string.Equals(allowed, status, StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Status must be one of: Placed, Processing, Shipped, Delivered, Cancelled.");
    }
}