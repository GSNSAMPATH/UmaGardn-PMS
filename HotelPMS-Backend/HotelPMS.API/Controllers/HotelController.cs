using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HotelPMS.Application.DTOs;

namespace HotelPMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HotelController : ControllerBase
    {
        private readonly IHotelRepository _hotelRepository;

        public HotelController(IHotelRepository hotelRepository)
        {
            _hotelRepository = hotelRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Hotel>>> GetHotels()
        {
            var hotels = await _hotelRepository.GetAllAsync();
            return Ok(hotels);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Hotel>> GetHotel(int id)
        {
            var hotel = await _hotelRepository.GetByIdAsync(id);
            if (hotel == null) return NotFound();
            return Ok(hotel);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Hotel>> CreateHotel([FromBody] Hotel hotel)
        {
            var createdHotel = await _hotelRepository.AddAsync(hotel);
            return CreatedAtAction(nameof(GetHotel), new { id = createdHotel.HotelId }, createdHotel);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]   // ✅ only Admin role can call this
        public async Task<IActionResult> UpdateHotel(int id, [FromBody] Hotel updatedHotel)
        {
            if (id != updatedHotel.HotelId)
            {
                Console.WriteLine(id);
                return BadRequest("Hotel ID mismatch");
            }

            var existingHotel = await _hotelRepository.GetByIdAsync(id);
            if (existingHotel == null)
            {
                return NotFound();
            }

            // Update fields
            existingHotel.Name = updatedHotel.Name;
            existingHotel.Address = updatedHotel.Address;
            existingHotel.Phone = updatedHotel.Phone;
            existingHotel.Email = updatedHotel.Email;

            await _hotelRepository.UpdateAsync(existingHotel); // ✅ use repository

            return Ok(existingHotel);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteHotel(int id)
        {
            var deleted = await _hotelRepository.DeleteAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }
    }
}
