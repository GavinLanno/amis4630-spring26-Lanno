using HelloWorldApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/checkout")]
public class CheckoutController : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(typeof(CheckoutResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<CheckoutResponseDto> Checkout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown-user";

        return Ok(new CheckoutResponseDto(
            Message: "Checkout request accepted.",
            CheckedOutByUserId: userId,
            ProcessedAtUtc: DateTime.UtcNow));
    }
}
