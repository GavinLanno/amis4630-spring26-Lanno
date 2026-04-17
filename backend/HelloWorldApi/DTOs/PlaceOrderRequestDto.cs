using System.ComponentModel.DataAnnotations;

namespace HelloWorldApi.DTOs;

public record PlaceOrderRequestDto(
    [Required, MaxLength(120)] string FullName,
    [Required, MaxLength(120)] string AddressLine1,
    [Required, MaxLength(80)] string City,
    [Required, MaxLength(80)] string StateProvince,
    [Required, MaxLength(20)] string PostalCode,
    [Required, MaxLength(80)] string Country,
    [Required, MaxLength(30)] string PhoneNumber
);
