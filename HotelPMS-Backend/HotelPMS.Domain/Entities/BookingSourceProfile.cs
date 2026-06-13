namespace HotelPMS.Domain.Entities;

public class BookingSourceProfile
{
    public string Id { get; set; } = null!;
    public string Label { get; set; } = null!;
    public string SourceType { get; set; } = null!;
    public string WhoPays { get; set; } = null!;
    public string PaymentTiming { get; set; } = null!;
    public decimal? CommissionPercent { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}