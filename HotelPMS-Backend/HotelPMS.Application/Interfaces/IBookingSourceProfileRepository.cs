using HotelPMS.Domain.Entities;

namespace HotelPMS.Application.Interfaces
{
    public interface IBookingSourceProfileRepository
    {
        Task<IEnumerable<BookingSourceProfile>> GetAllAsync();
        Task<BookingSourceProfile?> GetByIdAsync(string id);
        Task<BookingSourceProfile> AddAsync(BookingSourceProfile source);
        Task<BookingSourceProfile?> UpdateAsync(string id, BookingSourceProfile source);
        Task<bool> DeleteAsync(string id);
    }
}