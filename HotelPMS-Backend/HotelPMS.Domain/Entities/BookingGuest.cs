namespace HotelPMS.Domain.Entities;

public class BookingGuest
{
    public int BookingGuestId  { get; set; }
    public string GuestCode  { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string IdType { get; set; } = null!;
    public string IdNumber { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Country { get; set; }

    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;   // ✅ This now resolves correctly
}