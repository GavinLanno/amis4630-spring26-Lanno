namespace HelloWorldApi.DTOs;

public record AdminStatusDto(
    string Message,
    DateTime CheckedAtUtc
);
