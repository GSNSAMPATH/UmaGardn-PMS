namespace HotelPMS.Domain.Entities;

public enum StaffRole
{
    Admin,
    Manager,
    Housekeeper,
    Frontmanager,
    Staff
}

public class Staff
{
    public int StaffId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public StaffRole Role { get; set; }
    public string Phone { get; set; } = string.Empty;

    // ✅ make nullable to avoid InvalidCastException
    public string? ProfileImageUrl { get; set; }

    // ✅ always set as UTC
    public DateTime CreatedAt { get; set; }
}