using HelloWorldApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    [HttpGet("status")]
    [ProducesResponseType(typeof(AdminStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public ActionResult<AdminStatusDto> GetStatus()
    {
        return Ok(new AdminStatusDto(
            Message: "Admin endpoint is available.",
            CheckedAtUtc: DateTime.UtcNow));
    }
}
