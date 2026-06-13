using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public class MealPlanRepository : IMealPlanRepository
{
    private readonly AppDbContext _context;
    public MealPlanRepository(AppDbContext context) => _context = context;

    public async Task<List<MealPlan>> GetAllAsync() =>
        await _context.MealPlans.ToListAsync();

    public async Task<MealPlan?> GetByIdAsync(int id) =>
        await _context.MealPlans.FirstOrDefaultAsync(m => m.MealPlanId == id);

    public async Task<MealPlan> AddAsync(MealPlan mealPlan)
    {
        _context.MealPlans.Add(mealPlan);
        await _context.SaveChangesAsync();
        return mealPlan;
    }

    public async Task<MealPlan?> UpdateAsync(MealPlan mealPlan)
    {
        var existing = await _context.MealPlans.FindAsync(mealPlan.MealPlanId);
        if (existing == null) return null;

        existing.Name = mealPlan.Name;
        existing.Description = mealPlan.Description;
        existing.Price = mealPlan.Price;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var mealPlan = await _context.MealPlans.FindAsync(id);
        if (mealPlan == null) return false;

        _context.MealPlans.Remove(mealPlan);
        await _context.SaveChangesAsync();
        return true;
    }
}