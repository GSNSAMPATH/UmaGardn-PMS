using HotelPMS.Domain.Enums;

namespace HotelPMS.Application.DTOs
{
    public class AddonDto
    {
        public int AddonId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public AddonChargeType ChargeType { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateAddonDto
    {
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public AddonChargeType ChargeType { get; set; }
    }

    public class UpdateAddonDto
    {
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public AddonChargeType ChargeType { get; set; }
        public bool IsActive { get; set; }
    }
}