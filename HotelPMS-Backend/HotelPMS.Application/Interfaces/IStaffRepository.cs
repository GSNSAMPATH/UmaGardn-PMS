using HotelPMS.Domain.Entities;

namespace HotelPMS.Application.Interfaces;

public interface IStaffRepository
{
    Task<Staff?> GetByEmailAsync(string email);
    Task<Staff?> GetByIdAsync(int id);
    Task<Staff> AddAsync(Staff staff);
    Task<IEnumerable<Staff>> GetAllAsync();
     Task UpdateAsync(Staff staff);
    Task<bool> DeleteAsync(int id);


}
