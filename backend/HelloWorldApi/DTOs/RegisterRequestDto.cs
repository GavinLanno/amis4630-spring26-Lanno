namespace HelloWorldApi.DTOs;

public record RegisterRequestDto(
    string UserId,
    string Password,
    string Role
);