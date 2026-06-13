using HotelPMS.Domain.Entities;

namespace HotelPMS.Application.Interfaces
{
    public interface IHotelRepository
    {
        Task<IEnumerable<Hotel>> GetAllAsync();
        Task<Hotel?> GetByIdAsync(int id);
        Task<Hotel> AddAsync(Hotel hotel);
        Task<Hotel?> UpdateAsync(Hotel hotel);
        Task<bool> DeleteAsync(int id);
    }
}
