using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelloWorldApi.Models;

public class Order
{
    public int Id { get; set; }

    public int AuthUserId { get; set; }
    public AuthUser AuthUser { get; set; } = null!;

    public DateTime OrderDateUtc { get; set; } = DateTime.UtcNow;

    [MaxLength(32)]
    public string Status { get; set; } = string.Empty;

    [Column(TypeName = "decimal(12,2)")]
    public decimal Total { get; set; }

    [MaxLength(500)]
    public string ShippingAddress { get; set; } = string.Empty;

    [MaxLength(64)]
    public string ConfirmationNumber { get; set; } = string.Empty;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
