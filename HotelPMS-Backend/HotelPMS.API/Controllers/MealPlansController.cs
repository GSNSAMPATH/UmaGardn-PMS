using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HotelPMS.Application.DTOs;

namespace HotelPMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MealPlansController : ControllerBase
{
    private readonly IMealPlanRepository _repo;

    public MealPlansController(IMealPlanRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create(CreateMealPlanDto dto)
    {
        var mealPlan = new MealPlan
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price
        };

        var created = await _repo.AddAsync(mealPlan);
        return Ok(created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Update(int id, UpdateMealPlanDto dto)
    {
        if (id != dto.MealPlanId) return BadRequest();

        var mealPlan = new MealPlan
        {
            MealPlanId = dto.MealPlanId,
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price
        };

        var updated = await _repo.UpdateAsync(mealPlan);
        if (updated == null) return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _repo.DeleteAsync(id);
        if (!deleted) return NotFound();

        return Ok(new { message = "Meal plan deleted" });
    }
}