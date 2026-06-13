namespace HotelPMS.Domain.Entities;

public class Payment
{
    public int PaymentId { get; set; }
    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public string TransactionId { get; set; } = null!;
    public DateTime PaymentDate { get; set; }
    public PaymentStatus Status { get; set; }
    public string SubInvoiceNumber { get; set; } = null!;

}