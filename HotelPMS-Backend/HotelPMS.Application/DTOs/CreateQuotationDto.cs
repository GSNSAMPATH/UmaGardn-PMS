namespace HotelPMS.Application.DTOs.Quotation
{
    public class RoomSelectionDto
    {
        public int RoomId { get; set; }
        public int RoomTypeId { get; set; }
    }

    public class CreateQuotationDto
    {
        public string Name { get; set; } = string.Empty;
        public string IdType { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        public DateTime CheckinDate { get; set; }
        public DateTime CheckoutDate { get; set; }

        public int MealPlanId { get; set; }
        public int AddonId { get; set; }

        // ✅ Add this property
        public List<RoomSelectionDto> Rooms { get; set; } = new();
        public int Adults { get; set; }   // ✅ added
        public int Children { get; set; } // ✅ added



        public decimal Discount { get; set; }
    }

        public class QuotationDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CheckinDate { get; set; }
        public DateTime CheckoutDate { get; set; }
        public decimal TotalAmount { get; set; }

        public List<RoomSelectionDto> Rooms { get; set; } = new();
    }


}