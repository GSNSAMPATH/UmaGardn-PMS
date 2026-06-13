namespace HotelPMS.Application.Interfaces;

using HotelPMS.Domain.Entities;

public interface IRoomRepository
{
    Task<List<Room>> GetAllAsync();
    Task<Room?> GetByIdAsync(int id);
    Task<Room> AddAsync(Room room);
    Task<Room?> UpdateAsync(Room room);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Room>> GetAvailableAsync(DateTime checkin, DateTime checkout);

}
