namespace HelloWorldApi.DTOs;

public record UpdateListingRequestDto(
    string Address,
    string Description,
    decimal Price,
    int CategoryId,
    string SellerName,
    string? ImageURL
);