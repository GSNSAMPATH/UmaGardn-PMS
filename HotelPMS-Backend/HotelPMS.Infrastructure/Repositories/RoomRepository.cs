// 
using HotelPMS.Domain.Enums;
using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelPMS.Infrastructure.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly AppDbContext _context;
    public RoomRepository(AppDbContext context) => _context = context;

    // ✅ Get all rooms with RoomType details
    public async Task<List<Room>> GetAllAsync() =>
        await _context.Rooms
            .Include(r => r.RoomType)
            .ToListAsync();

    // ✅ Get single room by Id with RoomType details
    public async Task<Room?> GetByIdAsync(int id) =>
        await _context.Rooms
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.RoomId == id);

    // ✅ Add new room and reload with RoomType
    public async Task<Room> AddAsync(Room room)
    {
        _context.Rooms.Add(room);

        await _context.SaveChangesAsync();

        return await _context.Rooms
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.RoomId == room.RoomId)
            ?? room; // fallback if not found
    }

    // ✅ Update existing room and reload with RoomType
    public async Task<Room?> UpdateAsync(Room room)
    {
        var existing = await _context.Rooms.FindAsync(room.RoomId);
        if (existing is null) return null;

        existing.RoomNumber = room.RoomNumber;
        existing.RoomTypeId = room.RoomTypeId;
        existing.Floor = room.Floor;
        existing.Status = room.Status;

        if (!string.IsNullOrEmpty(room.ImageUrl))
        {
            existing.ImageUrl = room.ImageUrl;
        }

        await _context.SaveChangesAsync();

        return await _context.Rooms
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.RoomId == room.RoomId);
    }

    // ✅ Delete room safely
    public async Task<bool> DeleteAsync(int id)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room is null) return false;

        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Room>> GetAvailableAsync(DateTime checkin, DateTime checkout)
    {
        var bookedRoomIds = await _context.BookingRooms
            .Include(br => br.Booking)
            .Where(br =>
                br.Booking.Status != BookingStatus.Cancelled &&
                checkin < br.Booking.CheckoutDate &&
                checkout > br.Booking.CheckinDate)
            .Select(br => br.RoomId)
            .ToListAsync();

        return await _context.Rooms
            .Include(r => r.RoomType)
            .Where(r => !bookedRoomIds.Contains(r.RoomId))
            .ToListAsync();
    }
}