using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

public class CreateRoomTypeDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int MaxAdults { get; set; }
    public int MaxChildren { get; set; }
    public string Size { get; set; } = string.Empty;
    public string BedType { get; set; } = string.Empty;
}

public class RoomTypeResponseDto
{
    public int RoomTypeId { get; set; }
    public string RoomTypeCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int MaxAdults { get; set; }
    public int MaxChildren { get; set; }
    public string Size { get; set; } = string.Empty;
    public string BedType { get; set; } = string.Empty;

    public List<RoomResponseDto> Rooms { get; set; } = new();
}