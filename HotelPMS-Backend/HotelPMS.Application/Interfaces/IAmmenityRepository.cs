using HotelPMS.Domain.Entities;

namespace HotelPMS.Application.Interfaces
{
    public interface IAmenityRepository
    {
        Task<List<Amenity>> GetAllAsync();
        Task<Amenity?> GetByIdAsync(int id);
        Task<Amenity> AddAsync(Amenity amenity);
        Task<Amenity?> UpdateAsync(Amenity amenity);
        Task<bool> DeleteAsync(int id);
    }
}