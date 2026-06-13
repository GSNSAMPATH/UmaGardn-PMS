using HotelPMS.Domain.Entities;

namespace HotelPMS.Application.Interfaces
{
    public interface IAddonRepository
    {
        Task<IEnumerable<Addon>> GetAllAsync();
        Task<Addon?> GetByIdAsync(int id);
        Task<Addon> AddAsync(Addon addon);
        Task<Addon?> UpdateAsync(int id, Addon addon);
        Task<bool> DeleteAsync(int id);
    }
}