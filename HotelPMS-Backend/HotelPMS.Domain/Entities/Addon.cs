using HotelPMS.Domain.Enums;

namespace HotelPMS.Domain.Entities
{
    public class Addon
    {
        public int AddonId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public AddonChargeType ChargeType { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}