using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HotelPMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomRepository _roomRepository;

    public RoomsController(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    // GET: api/rooms
[HttpGet]
public async Task<IActionResult> GetAllRooms()
{
    var rooms = await _roomRepository.GetAllAsync();

    var response = rooms.Select(r => new RoomResponseDto
    {
        RoomId = r.RoomId,
        RoomCode = r.RoomCode,
        RoomNumber = r.RoomNumber,
        Floor = r.Floor,
        Status = r.Status.ToString(), // ✅ convert enum to string
        ImageUrl = r.ImageUrl,
        RoomTypeId = r.RoomTypeId,
        RoomTypeName = r.RoomType.Name,
        RoomTypeBasePrice = r.RoomType.BasePrice,
        BedType = r.RoomType.BedType,
        RoomTypeSize = r.RoomType.Size,
        RoomTypeMaxAdults = r.RoomType.MaxAdults,
        RoomTypeMaxChildren = r.RoomType.MaxChildren,
        RoomTypeDescription = r.RoomType.Description
    });


    return Ok(response);
}


[HttpGet("available")]
public async Task<IActionResult> GetAvailableRooms(DateTime checkin, DateTime checkout , int? guestsCount = null)
{
    // Force UTC kind
    checkin = DateTime.SpecifyKind(checkin, DateTimeKind.Utc);
    checkout = DateTime.SpecifyKind(checkout, DateTimeKind.Utc);

    var rooms = await _roomRepository.GetAvailableAsync(checkin, checkout);

    if (guestsCount.HasValue)
    {
        rooms = rooms.Where(r =>
            (r.RoomType?.MaxAdults ?? 0) +
            (r.RoomType?.MaxChildren ?? 0)
            >= guestsCount.Value
        ).ToList();
    }

    var response = rooms.Select(r => new RoomResponseDto
    {
        RoomId = r.RoomId,
        RoomCode = r.RoomCode,
        RoomNumber = r.RoomNumber,
        Floor = r.Floor,
        Status = r.Status.ToString(),
        ImageUrl = r.ImageUrl,
        RoomTypeId = r.RoomTypeId,
        RoomTypeName = r.RoomType?.Name ?? string.Empty,
        RoomTypeBasePrice = r.RoomType?.BasePrice ?? 0,
        BedType = r.RoomType?.BedType ?? string.Empty,
        RoomTypeSize = r.RoomType?.Size ?? string.Empty,
        RoomTypeMaxAdults = r.RoomType?.MaxAdults ?? 0,
        RoomTypeMaxChildren = r.RoomType?.MaxChildren ?? 0,
        RoomTypeDescription = r.RoomType?.Description ?? string.Empty
    });

    return Ok(response);
}

    // GET: api/rooms/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Room>> GetRoom(int id)
    {
        var room = await _roomRepository.GetByIdAsync(id);
        if (room == null) return NotFound();
        return Ok(room);
    }

    // POST: api/rooms
    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<RoomResponseDto>> CreateRoom([FromForm] CreateRoomDto dto)
    {
        if (dto.Image == null)
        {
            return BadRequest("Image is required for room creation.");
        }

        var statusEnum = Enum.Parse<RoomStatus>(dto.Status, ignoreCase: true);

        // Auto-generate RoomCode
        var lastRoom = (await _roomRepository.GetAllAsync())
            .OrderByDescending(r => r.RoomId)
            .FirstOrDefault();

        int nextNumber = 1;
        if (lastRoom != null && !string.IsNullOrEmpty(lastRoom.RoomCode))
            if (int.TryParse(lastRoom.RoomCode.Substring(1), out int lastNumber))
                nextNumber = lastNumber + 1;

        string generatedRoomCode = $"R{nextNumber:D3}";

        // ✅ Save image
        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "rooms");
        if (!Directory.Exists(uploadDir)) Directory.CreateDirectory(uploadDir);

        var fileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
        var filePath = Path.Combine(uploadDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await dto.Image.CopyToAsync(stream);

        string imageUrl = $"/images/rooms/{fileName}";

        var room = new Room
        {
            RoomCode = generatedRoomCode,
            RoomNumber = dto.RoomNumber,
            Floor = dto.Floor,
            Status = statusEnum,
            RoomTypeId = dto.RoomTypeId,
            ImageUrl = imageUrl // ✅ always set
        };

        var createdRoom = await _roomRepository.AddAsync(room);

        var response = new RoomResponseDto
        {
            RoomId = createdRoom.RoomId,
            RoomCode = createdRoom.RoomCode,
            RoomNumber = createdRoom.RoomNumber,
            Floor = createdRoom.Floor,
            Status = createdRoom.Status.ToString(),
            RoomTypeId = createdRoom.RoomTypeId,
            RoomTypeName = createdRoom.RoomType.Name,
            RoomTypeDescription = createdRoom.RoomType.Description,
            ImageUrl = createdRoom.ImageUrl
        };

        return CreatedAtAction(nameof(GetRoom), new { id = response.RoomId }, response);
    }
        // PUT: api/rooms/{id}
    [HttpPut("{id}")]

    public async Task<ActionResult<RoomResponseDto>> UpdateRoom(int id, [FromForm] UpdateRoomDto dto)
    {
        if (id != dto.RoomId) return BadRequest();

        var statusEnum = Enum.Parse<RoomStatus>(dto.Status, ignoreCase: true);

        string? imageUrl = null;
        if (dto.Image != null)
        {
            var fileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
            var filePath = Path.Combine("wwwroot/images/rooms", fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            imageUrl = $"/images/rooms/{fileName}";
        }

        var room = new Room
        {
            RoomId = dto.RoomId,
            RoomNumber = dto.RoomNumber,
            Floor = dto.Floor,
            Status = statusEnum,
            RoomTypeId = dto.RoomTypeId,
            ImageUrl = imageUrl ?? null // keep old if not updated
        };

        var updatedRoom = await _roomRepository.UpdateAsync(room);
        if (updatedRoom == null) return NotFound();

        var response = new RoomResponseDto
        {
            RoomId = updatedRoom.RoomId,
            RoomCode = updatedRoom.RoomCode,
            RoomNumber = updatedRoom.RoomNumber,
            Floor = updatedRoom.Floor,
            Status = updatedRoom.Status.ToString(),
            RoomTypeId = updatedRoom.RoomTypeId,
            RoomTypeName = updatedRoom.RoomType.Name,
            RoomTypeDescription = updatedRoom.RoomType.Description,
            ImageUrl = updatedRoom.ImageUrl
        };

        return Ok(response);
    }

    // DELETE: api/rooms/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var deleted = await _roomRepository.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
