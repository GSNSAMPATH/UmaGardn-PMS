using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelPMS.Infrastructure.Repositories
{
    public class HotelRepository : IHotelRepository
    {
        private readonly AppDbContext _dbContext;

        public HotelRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<Hotel>> GetAllAsync()
        {
            return await _dbContext.Hotels.ToListAsync();
        }

        public async Task<Hotel?> GetByIdAsync(int id)
        {
            return await _dbContext.Hotels.FindAsync(id);
        }

        public async Task<Hotel> AddAsync(Hotel hotel)
        {
            _dbContext.Hotels.Add(hotel);
            await _dbContext.SaveChangesAsync();
            return hotel;
        }

        public async Task<Hotel?> UpdateAsync(Hotel hotel)
        {
            var existingHotel = await _dbContext.Hotels.FindAsync(hotel.HotelId);
            if (existingHotel == null) return null;

            existingHotel.Name = hotel.Name;
            existingHotel.Address = hotel.Address;
            existingHotel.Phone = hotel.Phone;
            existingHotel.Email = hotel.Email;

            await _dbContext.SaveChangesAsync();
            return existingHotel;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var hotel = await _dbContext.Hotels.FindAsync(id);
            if (hotel == null) return false;

            _dbContext.Hotels.Remove(hotel);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
