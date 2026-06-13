using HotelPMS.Domain.Enums;

public class CreateBookingDto
{
    public BookingGuestDto Guest { get; set; } = null!;
    public string SourceId { get; set; }
    public DateTime CheckinDate { get; set; }
    public DateTime CheckoutDate { get; set; }
    public int? Adalts { get; set; }
    public int? Children { get; set; }
    public decimal Discount { get; set; }
    public List<CreateBookingRoomDto> Rooms { get; set; } = new();
    // ✅ Separate collections
    public List<CreateBookingAddonDto> Addons { get; set; } = new();
    public List<CreateBookingMealPlanDto> MealPlans { get; set; } = new();

    public PaymentDto? Payment { get; set; }
}

public class BookingGuestDto
{
    public string Name { get; set; } = null!;
    public string Guestcode { get; set; } = null!;
    public string IdType { get; set; } = null!;
    public string IdNumber { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Country { get; set; }
}

public class CreateBookingRoomDto
{
    public int RoomId { get; set; }
    public int RoomTypeId { get; set; }
    public decimal PricePerNight { get; set; }
}

// ✅ Addon DTO now references AddonId
public class CreateBookingAddonDto
{
    public int AddonId { get; set; }
    public decimal Price { get; set; }
}

// ✅ New DTO for MealPlans
public class CreateBookingMealPlanDto
{
    public int MealPlanId { get; set; }
    public decimal Price { get; set; }
}


public class PaymentDto
{
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public string TransactionId { get; set; } = null!;
    public DateTime PaymentDate { get; set; }
    public PaymentStatus Status { get; set; }
    // public string SubInvoiceNumber { get; set; } = null!;
}