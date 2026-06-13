namespace HotelPMS.Domain.Entities;

public class BookingMealPlan
{
    public int BookingMealPlanId { get; set; }
    public int BookingId { get; set; }
    public int MealPlanId { get; set; }
    public decimal Price { get; set; }

    public Booking Booking { get; set; } = null!;
    public MealPlan MealPlan { get; set; } = null!;
}
