namespace HelloWorldApi.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public int AuthUserId { get; set; }
    public AuthUser AuthUser { get; set; } = null!;
    public string TokenHash { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
}
