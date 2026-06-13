
namespace HotelPMS.Application.DTOs;

public class CheckoutDto
{
    public int BookingId { get; set; }
    public List<PaymentDto> Payments { get; set; } = new();
}