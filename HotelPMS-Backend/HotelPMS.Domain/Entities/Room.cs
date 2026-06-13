using HotelPMS.Domain.Entities;
namespace HotelPMS.Domain.Entities
{
    public enum RoomStatus
{
    Available,
    Occupied,
    Maintenance,
    Unavailable
}

    public class Room
    {
        public int RoomId { get; set; }
        public string RoomCode { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int Floor { get; set; }
        public RoomStatus Status { get; set; } = RoomStatus.Available;
        public int RoomTypeId { get; set; }
        public RoomType RoomType { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    
}
