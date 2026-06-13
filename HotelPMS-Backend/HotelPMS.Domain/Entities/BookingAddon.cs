namespace HotelPMS.Domain.Entities;

public class BookingAddon
{
    public int BookingAddonId { get; set; }
    public int BookingId { get; set; }
    public int AddonId { get; set; }
    public decimal Price { get; set; }

    public Booking Booking { get; set; } = null!;
    public Addon Addon { get; set; } = null!;
}

