using Microsoft.AspNetCore.Http;

public class RoomResponseDto
{
    public int RoomId { get; set; }
    public string RoomCode { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string Status { get; set; } = string.Empty; // ✅ string for API response

    public int RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public decimal RoomTypeBasePrice { get; set; }
    public string BedType { get; set; } = string.Empty;
    public string? RoomTypeSize { get; set; } 
    public int RoomTypeMaxAdults { get; set; }
    public int RoomTypeMaxChildren { get; set; }
    public string? RoomTypeDescription { get; set; }

    // ✅ new property for image
    public string? ImageUrl { get; set; }
}


public  class CreateRoomDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string Status { get; set; } = "available";
    public int RoomTypeId { get; set; }
    public IFormFile? Image { get; set; }
}

public class UpdateRoomDto
{
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string Status { get; set; } = "available";
    public int RoomTypeId { get; set; }
    public IFormFile? Image { get; set; }
}