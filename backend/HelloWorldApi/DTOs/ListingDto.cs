namespace HelloWorldApi.DTOs;

public record ListingDto(
    int Id,
    string Address,
    string Description,
    decimal Price,
    string CategoryName,
    string SellerName,
    DateTime PostedDate,
    string ImageURL
);
