using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Linq; 
using HotelPMS.Application.DTOs;

namespace HotelPMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeRepository _repository;

        public RoomTypesController(IRoomTypeRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetRoomTypes()
        {
            var roomTypes = await _repository.GetAllAsync();
            return Ok(roomTypes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetRoomType(int id)
        {
            var roomType = await _repository.GetByIdAsync(id);
            if (roomType == null) return NotFound();

            return Ok(new {
                roomType.RoomTypeId,
                roomType.RoomTypeCode,
                roomType.Name,
                roomType.Description,
                roomType.BasePrice,
                roomType.MaxAdults,
                roomType.MaxChildren,
                roomType.Size,
                roomType.BedType
            });
        }

        [HttpGet("{id}/rooms")]
        public async Task<IActionResult> GetRoomsByRoomTypeId(int id)
        {
            var roomType = await _repository.GetByIdAsync(id);

            if (roomType == null)
                return NotFound("Room type not found");

            return Ok(new
            {
                roomType.RoomTypeId,
                roomType.RoomTypeCode,
                roomType.Name,
                roomType.Description,
                roomType.BasePrice,
                roomType.MaxAdults,
                roomType.MaxChildren,
                roomType.Size,
                roomType.BedType,

                Rooms = roomType.Rooms.Select(r => new
                {
                    r.RoomId,
                    r.RoomCode,
                    r.RoomNumber,
                    r.Floor,
                    Status = r.Status.ToString(),
                    r.ImageUrl
                })
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> CreateRoomType([FromBody] CreateRoomTypeDto dto)
        {
            // ✅ Auto-generate RoomTypeCode
            var lastRoomType = (await _repository.GetAllAsync())
                .OrderByDescending(rt => rt.RoomTypeId)
                .FirstOrDefault();

            int nextNumber = 1;
            if (lastRoomType != null && !string.IsNullOrEmpty(lastRoomType.RoomTypeCode))
            {
                if (int.TryParse(lastRoomType.RoomTypeCode.Substring(2), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            string generatedCode = $"RT{nextNumber:D3}";

            var roomType = new RoomType
            {
                RoomTypeCode = generatedCode,
                Name = dto.Name,
                Description = dto.Description,
                BasePrice = dto.BasePrice,
                MaxAdults = dto.MaxAdults,
                MaxChildren = dto.MaxChildren,
                Size = dto.Size,
                BedType = dto.BedType
            };

            await _repository.AddAsync(roomType);

            return CreatedAtAction(nameof(GetRoomType), new { id = roomType.RoomTypeId }, roomType);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> UpdateRoomType(int id, [FromBody] RoomType roomType)
        {
            if (id != roomType.RoomTypeId)
                return BadRequest();

            await _repository.UpdateAsync(roomType);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteRoomType(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
