using HotelPMS.Domain.Entities;

public interface IMealPlanRepository
{
    Task<List<MealPlan>> GetAllAsync();
    Task<MealPlan?> GetByIdAsync(int id);
    Task<MealPlan> AddAsync(MealPlan mealPlan);
    Task<MealPlan?> UpdateAsync(MealPlan mealPlan);
    Task<bool> DeleteAsync(int id);
}