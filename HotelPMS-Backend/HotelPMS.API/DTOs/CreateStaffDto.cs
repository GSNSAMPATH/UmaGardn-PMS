using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

public class CreateStaffDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;   // raw password
    public StaffRole Role { get; set; }
    public string Phone { get; set; } = string.Empty;

    // ✅ uploaded image file
    public IFormFile? ProfileImage { get; set; }
}

public class UpdateStaffDto
{
    public int StaffId { get; set; }   // include ID for update
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;   // raw password
    public StaffRole Role { get; set; }
    public string Phone { get; set; } = string.Empty;

    // ✅ optional uploaded image file
    public IFormFile? ProfileImage { get; set; }
}