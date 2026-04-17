using HelloWorldApi.Data;
using HelloWorldApi.DTOs;
using HelloWorldApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HelloWorldApi.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private const string InitialOrderStatus = "Placed";
    private readonly ListingContext _context;

    public OrdersController(ListingContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OrderDto>> PlaceOrder(PlaceOrderRequestDto request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity is required to place an order."
            });
        }

        var user = await _context.AuthUsers
            .FirstOrDefaultAsync(item => item.UserId == userIdClaim);

        if (user is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "The authenticated user could not be resolved."
            });
        }

        var cart = await _context.Carts
            .Include(item => item.CartItems)
            .ThenInclude(item => item.Listing)
            .ThenInclude(item => item.Category)
            .FirstOrDefaultAsync(item => item.UserId == user.UserId);

        if (cart is null || cart.CartItems.Count == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Cart is empty",
                Detail = "Add at least one item to your cart before placing an order."
            });
        }

        var shippingAddress = BuildShippingAddress(request);
        var orderDateUtc = DateTime.UtcNow;
        var orderItems = cart.CartItems.Select(item => new OrderItem
        {
            ListingId = item.ListingId,
            Address = item.Listing.Address,
            ImageURL = item.Listing.ImageURL,
            CategoryName = item.Listing.Category.Name,
            Price = item.Listing.Price,
            Quantity = item.Quantity,
            LineTotal = item.Listing.Price * item.Quantity
        }).ToList();

        var order = new Order
        {
            AuthUserId = user.Id,
            OrderDateUtc = orderDateUtc,
            Status = InitialOrderStatus,
            ShippingAddress = shippingAddress,
            Total = orderItems.Sum(item => item.LineTotal),
            ConfirmationNumber = string.Empty,
            OrderItems = orderItems
        };

        await using var transaction = await _context.Database.BeginTransactionAsync();

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        order.ConfirmationNumber = BuildConfirmationNumber(order.Id, orderDateUtc);

        _context.CartItems.RemoveRange(cart.CartItems);
        await _context.SaveChangesAsync();

        await transaction.CommitAsync();

        var response = MapOrder(order);

        return CreatedAtAction(nameof(GetMyOrders), response);
    }

    [HttpGet("mine")]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(typeof(List<OrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "A valid user identity is required to view order history."
            });
        }

        var authUserId = await _context.AuthUsers
            .Where(item => item.UserId == userIdClaim)
            .Select(item => (int?)item.Id)
            .FirstOrDefaultAsync();

        if (!authUserId.HasValue)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "The authenticated user could not be resolved."
            });
        }

        var orders = await _context.Orders
            .Where(item => item.AuthUserId == authUserId.Value)
            .Include(item => item.OrderItems)
            .OrderByDescending(item => item.OrderDateUtc)
            .ToListAsync();

        var response = orders.Select(MapOrder).ToList();

        return Ok(response);
    }

    private static string BuildShippingAddress(PlaceOrderRequestDto request)
    {
        return string.Join(", ",
            request.FullName,
            request.AddressLine1,
            request.City,
            request.StateProvince,
            request.PostalCode,
            request.Country,
            request.PhoneNumber);
    }

    private static string BuildConfirmationNumber(int orderId, DateTime orderDateUtc)
    {
        return $"BSL-{orderDateUtc:yyyyMMddHHmmss}-{orderId:D6}";
    }

    private static OrderDto MapOrder(Order order)
    {
        return new OrderDto(
            Id: order.Id,
            ConfirmationNumber: order.ConfirmationNumber,
            OrderDateUtc: order.OrderDateUtc,
            Status: order.Status,
            Total: order.Total,
            ShippingAddress: order.ShippingAddress,
            Items: order.OrderItems
                .Select(item => new OrderItemDto(
                    Id: item.Id,
                    ListingId: item.ListingId,
                    Address: item.Address,
                    ImageURL: item.ImageURL,
                    CategoryName: item.CategoryName,
                    Price: item.Price,
                    Quantity: item.Quantity,
                    LineTotal: item.LineTotal))
                .ToList());
    }
}
