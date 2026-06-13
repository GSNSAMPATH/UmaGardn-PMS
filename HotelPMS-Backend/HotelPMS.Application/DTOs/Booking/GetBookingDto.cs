using HotelPMS.Domain.Enums;
namespace HotelPMS.Application.DTOs.Booking;

public class GetBookingDto
{
    public int BookingId { get; set; }
    public string BookingRef { get; set; } = null!;
    public string SourceId { get; set; } = null!;
    public DateTime CheckinDate { get; set; }
    public DateTime CheckoutDate { get; set; }
    public int? Adalts { get; set; }
    public int? Children { get; set; }
    public decimal? Discount { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalAmount { get; set; }

    public List<GuestDto> Guests { get; set; } = new();
    public List<RoomDto> Rooms { get; set; } = new();
    public List<BookingAddonDto> Addons { get; set; } = new();
    public List<BookingMealPlanDto> MealPlans { get; set; } = new();

    public List<PaymentResponseDto> Payments { get; set; } = new();
}

public class GuestDto
{
    public int GuestId { get; set; }
    public string GuestCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Address { get; set;}
    public string? Country { get; set; }


}

public class RoomDto
{
    public int RoomId { get; set; }
    public int RoomTypeId { get; set; }
    public string RoomNumber { get; set; } = null!;
    public decimal PricePerNight { get; set; }
    public int Nights { get; set; }
}

// ✅ New Addon DTO
public class BookingAddonDto
{
    public int AddonId { get; set; }
    public string Name { get; set; } = null!;   // from Addon table
    public decimal Price { get; set; }
}

// ✅ New MealPlan DTO
public class BookingMealPlanDto
{
    public int MealPlanId { get; set; }
    public string Name { get; set; } = null!;   // from MealPlan table
    public decimal Price { get; set; }
}



public class PaymentResponseDto
{
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }
    public string TransactionId { get; set; } = null!;
    public DateTime PaymentDate { get; set; }
    public string SubInvoiceNumber { get; set; } = null!;
}

