namespace HelloWorldApi.DTOs;

public record CreateTokenRequestDto(
    string UserId,
    string Password
);