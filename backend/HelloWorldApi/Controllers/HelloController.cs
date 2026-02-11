using Microsoft.AspNetCore.Mvc;

namespace HelloWorldApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HelloController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetHello()
        {
            return Ok(new
            {
                message = "Hello from .NET! 🎉",
                timestamp = DateTime.UtcNow
            });
        }

        [HttpGet("personalized")]
        public IActionResult GetPersonalizedHello([FromQuery] string name = "Student")
        {
            return Ok(new
            {
                message = $"Hello, {name}! Welcome to full-stack development! 🚀",
                timestamp = DateTime.UtcNow
            });
        }

        [HttpGet("goodbye")]
        public IActionResult GetGOODBYE([FromQuery] string name = "Student")
        {
            return Ok(new
            {
                message = $"Goodbye, {name}! Peace be with you 🕊️",
                timestamp = DateTime.UtcNow
            });
        }

    }
}