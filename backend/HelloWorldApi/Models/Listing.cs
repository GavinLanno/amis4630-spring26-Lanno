namespace HelloWorldApi.Models;

public class Listing
{
    public int Id { get; set; }
    public string Address { get; set; } = string.Empty; //Title
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;    
    public DateTime PostedDate { get; set; } //Is this allowed as a DateTime or does it have to be a string
    public string ImageURL { get; set; } = string.Empty;    
}
