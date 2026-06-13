using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelPMS.Infrastructure.Repositories
{
    public class AmenityRepository : IAmenityRepository
    {
        private readonly AppDbContext _context;
        public AmenityRepository(AppDbContext context) => _context = context;

        public async Task<List<Amenity>> GetAllAsync() =>
            await _context.Amenities.ToListAsync();

        public async Task<Amenity?> GetByIdAsync(int id) =>
            await _context.Amenities.FindAsync(id);

        public async Task<Amenity> AddAsync(Amenity amenity)
        {
            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();
            return amenity;
        }

        public async Task<Amenity?> UpdateAsync(Amenity amenity)
        {
            var existing = await _context.Amenities.FindAsync(amenity.AmenityId);
            if (existing is null) return null;

            existing.Name = amenity.Name;
            existing.Icon = amenity.Icon;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity is null) return false;

            _context.Amenities.Remove(amenity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}