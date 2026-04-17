namespace HelloWorldApi.DTOs;

public record CheckoutResponseDto(
    string Message,
    string CheckedOutByUserId,
    DateTime ProcessedAtUtc
);
