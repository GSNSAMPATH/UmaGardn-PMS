namespace HotelPMS.Domain.Entities;
public class BookingRoom
{
    public int BookingRoomId { get; set; }
    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public int RoomTypeId { get; set; }
    public RoomType RoomType { get; set; } = null!;

    public decimal PricePerNight { get; set; }
    public int Nights { get; set; }
}