namespace HelloWorldApi.DTOs;

public record RegisterRequestDto(
    string UserId,
    string Email,
    string Password,
    string Role
);