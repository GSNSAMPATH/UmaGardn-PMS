using HotelPMS.Domain.Enums;

namespace HotelPMS.Domain.Entities;

public class Booking
{
    public int BookingId { get; set; }
    public string BookingRef { get; set; } = null!;
    public string SourceId { get; set; }
    public DateTime CheckinDate { get; set; }
    public DateTime CheckoutDate { get; set; }
    public DateTime? ActualCheckIn { get; set; }
    public DateTime? ActualCheckOut { get; set; }
    public int? Adalts { get; set; }
    public int? Children { get; set; }
    public decimal TotalAmount { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // ✅ FIX
    public DateTime? CancelledAt { get; set; }
    public decimal? Discount { get; set; }


    public ICollection<BookingGuest> Guests { get; set; } = new List<BookingGuest>();
    public ICollection<BookingRoom> BookingRooms { get; set; } = new List<BookingRoom>();
    public ICollection<BookingAddon> BookingAddons { get; set; } = new List<BookingAddon>();
    public ICollection<BookingMealPlan> BookingMealPlans { get; set; } = new List<BookingMealPlan>(); // 👈 add this
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

// using HotelPMS.Domain.Enums;

// namespace HotelPMS.Domain.Entities;

// public class Booking
// {
//     public int BookingId { get; set; }
//     public string BookingRef { get; set; } = null!;
//     public string? SourceId { get; set; }

//     // Reservation dates
//     public DateTime CheckinDate { get; set; }
//     public DateTime CheckoutDate { get; set; }

//     // Planned check-in/out times (hotel policy, e.g. 2 PM / 11 AM)
//     public DateTime? ActualCheckIn { get; set; }
//     public DateTime? ActualCheckOut { get; set; }

//     // // Actual guest activity
//     // public DateTimeOffset? ActualCheckIn { get; set; }
//     // public DateTimeOffset? ActualCheckOut { get; set; }

//     public int? Adalts { get; set; }
//     public int? Children { get; set; }
//     public decimal TotalAmount { get; set; }

//     public BookingStatus Status { get; set; } = BookingStatus.Confirmed;

//     public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
//     public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

//     // Navigation properties
//     public ICollection<BookingGuest> Guests { get; set; } = new List<BookingGuest>();
//     public ICollection<BookingRoom> BookingRooms { get; set; } = new List<BookingRoom>();
//     public ICollection<BookingAddon> BookingAddons { get; set; } = new List<BookingAddon>();
//     public ICollection<BookingMealPlan> BookingMealPlans { get; set; } = new List<BookingMealPlan>();
//     public ICollection<Payment> Payments { get; set; } = new List<Payment>();
// }