namespace HelloWorldApi.DTOs;

public record OrderDto(
    int Id,
    string ConfirmationNumber,
    DateTime OrderDateUtc,
    string Status,
    decimal Total,
    string ShippingAddress,
    IReadOnlyList<OrderItemDto> Items
);

public record OrderItemDto(
    int Id,
    int ListingId,
    string Address,
    string ImageURL,
    string CategoryName,
    decimal Price,
    int Quantity,
    decimal LineTotal
);
