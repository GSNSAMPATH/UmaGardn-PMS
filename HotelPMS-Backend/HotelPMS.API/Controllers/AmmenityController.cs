using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HotelPMS.Application.DTOs;

namespace HotelPMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AmenitiesController : ControllerBase
{
    private readonly IAmenityRepository _amenityRepository;

    public AmenitiesController(IAmenityRepository amenityRepository)
    {
        _amenityRepository = amenityRepository;
    }

    // GET: api/amenities
    [HttpGet]
    public async Task<IActionResult> GetAllAmenities()
    {
        var amenities = await _amenityRepository.GetAllAsync();
        var response = amenities.Select(a => new AmenityResponseDto
        {
            AmenityId = a.AmenityId,
            Name = a.Name,
            Description = a.Description,
            Icon = a.Icon
        });
        return Ok(response);
    }

    // GET: api/amenities/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<AmenityResponseDto>> GetAmenity(int id)
    {
        var amenity = await _amenityRepository.GetByIdAsync(id);
        if (amenity == null) return NotFound();

        return Ok(new AmenityResponseDto
        {
            AmenityId = amenity.AmenityId,
            Name = amenity.Name,
            Description = amenity.Description,
            Icon = amenity.Icon
        });
    }

    // POST: api/amenities
    // [HttpPost]
    // [Authorize(Roles = "Admin,Manager")]
    // public async Task<ActionResult<AmenityResponseDto>> CreateAmenity([FromForm] CreateAmenityDto dto)
    // {
    //     string fileName = $"{Guid.NewGuid()}_{dto.Icon.FileName}";
    //     string filePath = Path.Combine("wwwroot/images/amenities", fileName);

    //     Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

    //     using (var stream = new FileStream(filePath, FileMode.Create))
    //     {
    //         await dto.Icon.CopyToAsync(stream);
    //     }

    //     var amenity = new Amenity
    //     {
    //         Name = dto.Name,
    //         Icon = $"/images/amenities/{fileName}" // store relative path
    //     };

    //     var created = await _amenityRepository.AddAsync(amenity);

    //     return CreatedAtAction(nameof(GetAmenity), new { id = created.AmenityId }, new AmenityResponseDto
    //     {
    //         AmenityId = created.AmenityId,
    //         Name = created.Name,
    //         Description = created.Description,
    //         Icon = created.Icon
    //     });
    // }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<AmenityResponseDto>> CreateAmenity([FromForm] CreateAmenityDto dto)
    {
        if (dto.Icon == null)
            return BadRequest("Icon is required.");

        // ✅ Use null-forgiving operator after the null check
        string fileName = $"{Guid.NewGuid()}_{dto.Icon!.FileName}";
        string filePath = Path.Combine("wwwroot/images/amenities", fileName);

        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.Icon.CopyToAsync(stream);
        }

        var amenity = new Amenity
        {
            Name = dto.Name,
            Icon = $"/images/amenities/{fileName}"
        };

        var created = await _amenityRepository.AddAsync(amenity);

        return CreatedAtAction(nameof(GetAmenity), new { id = created.AmenityId }, new AmenityResponseDto
        {
            AmenityId = created.AmenityId,
            Name = created.Name,
            Description = created.Description,
            Icon = created.Icon
        });
    }

    // PUT: api/amenities/{id}
    // [HttpPut("{id}")]
    // [Authorize(Roles = "Admin,Manager")]
    // public async Task<ActionResult<AmenityResponseDto>> UpdateAmenity(int id, [FromForm] UpdateAmenityDto dto)
    // {
    //     if (id != dto.AmenityId) return BadRequest();

    //     var existing = await _amenityRepository.GetByIdAsync(dto.AmenityId);
    //     if (existing == null) return NotFound();

    //     existing.Name = dto.Name;

    //     if (dto.Icon != null)
    //     {
    //         string fileName = $"{Guid.NewGuid()}_{dto.Icon.FileName}";
    //         string filePath = Path.Combine("wwwroot/images/amenities", fileName);

    //         Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

    //         using (var stream = new FileStream(filePath, FileMode.Create))
    //         {
    //             await dto.Icon.CopyToAsync(stream);
    //         }

    //         existing.Icon = $"/images/amenities/{fileName}";
    //     }

    //     var updated = await _amenityRepository.UpdateAsync(existing);

    //     return Ok(new AmenityResponseDto
    //     {
    //         AmenityId = updated.AmenityId,
    //         Name = updated.Name,
    //         Description = updated.Description,
    //         Icon = updated.Icon
    //     });
    // }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<AmenityResponseDto>> UpdateAmenity(int id, [FromForm] UpdateAmenityDto dto)
    {
        if (id != dto.AmenityId) return BadRequest();

        var existing = await _amenityRepository.GetByIdAsync(dto.AmenityId);
        if (existing == null) return NotFound();

        existing.Name = dto.Name;

        if (dto.Icon != null)
        {
            string fileName = $"{Guid.NewGuid()}_{dto.Icon!.FileName}";
            string filePath = Path.Combine("wwwroot/images/amenities", fileName);

            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Icon!.CopyToAsync(stream);
            }

            existing.Icon = $"/images/amenities/{fileName}";
        }

        var updated = await _amenityRepository.UpdateAsync(existing);

        if (updated == null)
            return NotFound();

        return Ok(new AmenityResponseDto
        {
            AmenityId = updated.AmenityId,
            Name = updated.Name,
            Description = updated.Description,
            Icon = updated.Icon
        });
    }

    // DELETE: api/amenities/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAmenity(int id)
    {
        var deleted = await _amenityRepository.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}