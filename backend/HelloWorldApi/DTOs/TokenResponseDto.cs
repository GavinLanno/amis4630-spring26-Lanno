namespace HelloWorldApi.DTOs;

public record TokenResponseDto(
    string AccessToken,
    DateTime ExpiresAtUtc,
    string? RefreshToken = null
);