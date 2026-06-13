using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using HotelPMS.Infrastructure.Data;

namespace HotelPMS.Infrastructure.Repositories
{
    public class BookingSourceProfileRepository : IBookingSourceProfileRepository
    {
        private readonly AppDbContext _context;

        public BookingSourceProfileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BookingSourceProfile>> GetAllAsync()
            => await _context.BookingSourceProfiles.ToListAsync();

        public async Task<BookingSourceProfile?> GetByIdAsync(string id)
            => await _context.BookingSourceProfiles.FindAsync(id);

        public async Task<BookingSourceProfile> AddAsync(BookingSourceProfile source)
        {
            _context.BookingSourceProfiles.Add(source);
            await _context.SaveChangesAsync();
            return source;
        }

        public async Task<BookingSourceProfile?> UpdateAsync(string id, BookingSourceProfile source)
        {
            var existing = await _context.BookingSourceProfiles.FindAsync(id);
            if (existing == null) return null;

            existing.Label = source.Label;
            existing.SourceType = source.SourceType;
            existing.WhoPays = source.WhoPays;
            existing.PaymentTiming = source.PaymentTiming;
            existing.CommissionPercent = source.CommissionPercent;
            existing.IsActive = source.IsActive;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var existing = await _context.BookingSourceProfiles.FindAsync(id);
            if (existing == null) return false;

            _context.BookingSourceProfiles.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}