namespace HotelPMS.Application.DTOs
{
    public class BookingSourceProfileDto
    {
        public string Id { get; set; } = null!;
        public string Label { get; set; } = null!;
        public string SourceType { get; set; } = null!;
        public string WhoPays { get; set; } = null!;
        public string PaymentTiming { get; set; } = null!;
        public decimal? CommissionPercent { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateBookingSourceProfileDto
    {
        public string Id { get; set; } = null!;
        public string Label { get; set; } = null!;
        public string SourceType { get; set; } = null!;
        public string WhoPays { get; set; } = null!;
        public string PaymentTiming { get; set; } = null!;
        public decimal? CommissionPercent { get; set; }
    }

    public class UpdateBookingSourceProfileDto
    {
        public string Label { get; set; } = null!;
        public string SourceType { get; set; } = null!;
        public string WhoPays { get; set; } = null!;
        public string PaymentTiming { get; set; } = null!;
        public decimal? CommissionPercent { get; set; }
        public bool IsActive { get; set; }
    }
}