using HotelPMS.Domain.Entities;

public class StaffResponseDto
{
    public int StaffId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public StaffRole Role { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string ProfileImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}