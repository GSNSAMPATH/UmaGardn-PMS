namespace HotelPMS.Domain.Entities
{
    public class QuotationRoom
    {
        public int Id { get; set; }

        public int QuotationId { get; set; }
        public Quotation Quotation { get; set; }

        public int RoomId { get; set; }
        public Room Room { get; set; }
        public int RoomTypeId { get; set; }
        public RoomType RoomType { get; set; }
    }
}