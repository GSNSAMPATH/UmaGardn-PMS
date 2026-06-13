using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelPMS.Application.DTOs;

namespace HotelPMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffRepository _repo;
        private readonly IAuthService _authService;

        public StaffController(IStaffRepository repo, IAuthService authService)
        {
            _repo = repo;
            _authService = authService;
        }

        // Get all staff (Admin & Manager only)
        [HttpGet]
        // [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAll()
        {
            var staffList = await _repo.GetAllAsync();
            return Ok(staffList);
        }

        // Get staff by ID (Admin & Manager only)
        [HttpGet("{id}")]

        public async Task<IActionResult> Get(int id)
        {
            var staff = await _repo.GetByIdAsync(id);
            if (staff == null) return NotFound();
            return Ok(staff);
        }

    //     [HttpPost("{id}/upload-image")]
        
    //    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    //     {
    //         var staff = await _repo.GetByIdAsync(id);
    //         if (staff == null) return NotFound();

    //         if (file == null || file.Length == 0)
    //             return BadRequest("No file uploaded");

    //         // ✅ Build absolute path
    //         var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

    //         // ✅ Ensure folder exists
    //         if (!Directory.Exists(uploadPath))
    //             Directory.CreateDirectory(uploadPath);

    //         var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
    //         var filePath = Path.Combine(uploadPath, fileName);

    //         using (var stream = new FileStream(filePath, FileMode.Create))
    //         {
    //             await file.CopyToAsync(stream);
    //         }

    //         staff.ProfileImageUrl = $"/images/{fileName}";
    //         await _repo.UpdateAsync(staff);

    //         return Ok(new { message = "Image uploaded successfully", imageUrl = staff.ProfileImageUrl });
    //     }

        // [HttpPut("{id}")]
        // [Authorize(Roles = "Admin,Manager")]
        // public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffDto dto)
        // {
        //     var staff = await _repo.GetByIdAsync(id);
        //     if (staff == null) return NotFound();

        //     staff.Name = dto.Name;
        //     staff.Email = dto.Email;
        //     staff.Phone = dto.Phone;
        //     staff.Role = dto.Role;

        //     await _repo.UpdateAsync(staff);

        //     return Ok(staff);
        // }

        // Admin creates staff
        // [HttpPost]
        // [Authorize(Roles = "Admin,Manager")]
        // public async Task<IActionResult> Create([FromBody] CreateStaffDto dto)
        // {
        //     var staff = new Staff
        //     {
        //         Name = dto.Name,
        //         Email = dto.Email,
        //         PasswordHash = _authService.HashPassword(dto.Password),
        //         Role = dto.Role,
        //         Phone = dto.Phone,
        //         CreatedAt = DateTime.UtcNow
        //     };

        //     var created = await _repo.AddAsync(staff);

        //     var response = new StaffResponseDto
        //     {
        //         StaffId = created.StaffId,
        //         Name = created.Name,
        //         Email = created.Email,
        //         Role = created.Role,
        //         Phone = created.Phone,
        //         CreatedAt = created.CreatedAt
        //     };

        //     return CreatedAtAction(nameof(Get), new { id = response.StaffId }, response);
        // }

          // ✅ Create staff with image upload
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromForm] CreateStaffDto dto)
        {
            string? imageUrl = null;
            if (dto.ProfileImage != null)
            {
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "staff");
                Directory.CreateDirectory(uploadPath);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(dto.ProfileImage.FileName)}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ProfileImage.CopyToAsync(stream);
                }

                imageUrl = $"/images/staff/{fileName}";
            }

            var staff = new Staff
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = _authService.HashPassword(dto.Password),
                Role = dto.Role,
                Phone = dto.Phone,
                CreatedAt = DateTime.UtcNow,
                ProfileImageUrl = imageUrl ?? string.Empty
            };

            var created = await _repo.AddAsync(staff);

            return CreatedAtAction(nameof(Get), new { id = created.StaffId }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateStaffDto dto)
        {
            var staff = await _repo.GetByIdAsync(id);
            if (staff == null) return NotFound();

            staff.Name = dto.Name;
            staff.Email = dto.Email;
            staff.Phone = dto.Phone;
            staff.Role = dto.Role;

            if (dto.ProfileImage != null)
            {
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "staff");
                Directory.CreateDirectory(uploadPath);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(dto.ProfileImage.FileName)}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ProfileImage.CopyToAsync(stream);
                }

                staff.ProfileImageUrl = $"/images/staff/{fileName}";
            }

            try
            {
                await _repo.UpdateAsync(staff);
                return Ok(staff);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _repo.DeleteAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }


    }
}