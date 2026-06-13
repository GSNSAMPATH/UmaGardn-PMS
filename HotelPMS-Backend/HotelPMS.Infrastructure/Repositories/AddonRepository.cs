using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelPMS.Infrastructure.Repositories
{
    public class AddonRepository : IAddonRepository
    {
        private readonly AppDbContext _context;

        public AddonRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Addon>> GetAllAsync()
            => await _context.Addons.ToListAsync();

        public async Task<Addon?> GetByIdAsync(int id)
            => await _context.Addons.FindAsync(id);

        public async Task<Addon> AddAsync(Addon addon)
        {
            _context.Addons.Add(addon);
            await _context.SaveChangesAsync();
            return addon;
        }

        public async Task<Addon?> UpdateAsync(int id, Addon addon)
        {
            var existing = await _context.Addons.FindAsync(id);
            if (existing == null) return null;

            existing.Name = addon.Name;
            existing.Price = addon.Price;
            existing.ChargeType = addon.ChargeType;
            existing.IsActive = addon.IsActive;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.Addons.FindAsync(id);
            if (existing == null) return false;

            _context.Addons.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}