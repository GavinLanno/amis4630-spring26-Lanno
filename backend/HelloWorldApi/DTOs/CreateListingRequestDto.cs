namespace HelloWorldApi.DTOs;

public record CreateListingRequestDto(
    string Address,
    string Description,
    decimal Price,
    int CategoryId,
    string SellerName,
    string? ImageURL
);