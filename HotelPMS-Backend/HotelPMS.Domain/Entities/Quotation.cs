namespace HotelPMS.Domain.Entities
{
    public class Quotation
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string IdType { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        public DateTime CheckinDate { get; set; }
        public DateTime CheckoutDate { get; set; }

        public int MealPlanId { get; set; }
        public int AddonId { get; set; }
        public int? Adults { get; set; }
        public int? Children { get; set; }
        public ICollection<QuotationRoom> QuotationRooms { get; set; } = new List<QuotationRoom>();

        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}