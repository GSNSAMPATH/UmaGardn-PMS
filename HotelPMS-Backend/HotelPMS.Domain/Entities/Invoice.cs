using HotelPMS.Domain.Entities;
public class Invoice
{
    public int InvoiceId { get; set; }
    public int BookingId { get; set; }
    public string InvoiceNumber { get; set; } = null!;
    public DateTime IssuedAt { get; set; }
    public decimal TotalAmount { get; set; }

    public Booking Booking { get; set; } = null!;
}