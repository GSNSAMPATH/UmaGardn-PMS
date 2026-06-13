using HotelPMS.Application.DTOs;
using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HotelPMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingSourceProfileController : ControllerBase
    {
        private readonly IBookingSourceProfileRepository _repo;

        public BookingSourceProfileController(IBookingSourceProfileRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sources = await _repo.GetAllAsync();
            return Ok(sources);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var source = await _repo.GetByIdAsync(id);
            if (source == null) return NotFound();
            return Ok(source);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingSourceProfileDto dto)
        {
            var source = new BookingSourceProfile
            {
                Id = dto.Id,
                Label = dto.Label,
                SourceType = dto.SourceType,
                WhoPays = dto.WhoPays,
                PaymentTiming = dto.PaymentTiming,
                CommissionPercent = dto.CommissionPercent,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repo.AddAsync(source);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateBookingSourceProfileDto dto)
        {
            var source = new BookingSourceProfile
            {
                Id = id,
                Label = dto.Label,
                SourceType = dto.SourceType,
                WhoPays = dto.WhoPays,
                PaymentTiming = dto.PaymentTiming,
                CommissionPercent = dto.CommissionPercent,
                IsActive = dto.IsActive
            };

            var updated = await _repo.UpdateAsync(id, source);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _repo.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}