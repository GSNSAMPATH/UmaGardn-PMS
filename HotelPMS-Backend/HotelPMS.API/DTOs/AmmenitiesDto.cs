public class AmenityResponseDto
{
    public int AmenityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty; // stored path/URL
}

public class CreateAmenityDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IFormFile Icon { get; set; } = null!;
}

public class UpdateAmenityDto
{
    public int AmenityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IFormFile? Icon { get; set; } = null!;
}