namespace HotelPMS.Domain.Entities
{
    public class RoomType
    {
        public int RoomTypeId { get; set; }
        public string RoomTypeCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int MaxAdults { get; set; }
        public int MaxChildren { get; set; }
        public string? Size { get; set; } 
        public string? BedType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ✅ Navigation property back to Rooms
        public ICollection<Room> Rooms { get; set; } = new List<Room>();
    }
}