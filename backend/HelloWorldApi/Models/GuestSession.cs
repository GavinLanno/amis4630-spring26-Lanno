namespace HelloWorldApi.Models;

public class GuestSession
{
    public int Id { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAtUtc { get; set; }
}