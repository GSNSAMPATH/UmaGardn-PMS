using HotelPMS.Application.DTOs;
using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HotelPMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddonsController : ControllerBase
    {
        private readonly IAddonRepository _repo;

        public AddonsController(IAddonRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var addons = await _repo.GetAllAsync();
            var response = addons.Select(a => new AddonDto
            {
                AddonId = a.AddonId,
                Name = a.Name,
                Price = a.Price,
                ChargeType = a.ChargeType,
                IsActive = a.IsActive
            });
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var addon = await _repo.GetByIdAsync(id);
            if (addon == null) return NotFound();

            return Ok(new AddonDto
            {
                AddonId = addon.AddonId,
                Name = addon.Name,
                Price = addon.Price,
                ChargeType = addon.ChargeType,
                IsActive = addon.IsActive
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAddonDto dto)
        {
            var addon = new Addon
            {
                Name = dto.Name,
                Price = dto.Price,
                ChargeType = dto.ChargeType,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repo.AddAsync(addon);
            return CreatedAtAction(nameof(GetById), new { id = created.AddonId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAddonDto dto)
        {
            var addon = new Addon
            {
                Name = dto.Name,
                Price = dto.Price,
                ChargeType = dto.ChargeType,
                IsActive = dto.IsActive
            };

            var updated = await _repo.UpdateAsync(id, addon);
            if (updated == null) return NotFound();

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _repo.DeleteAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }
    }
}