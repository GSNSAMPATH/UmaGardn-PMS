using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelPMS.Infrastructure.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly AppDbContext _db;
        public StaffRepository(AppDbContext db) => _db = db;

        public async Task<Staff?> GetByEmailAsync(string email) =>
            await _db.Staffs.FirstOrDefaultAsync(s => s.Email == email);

        public async Task<Staff?> GetByIdAsync(int id) =>
            await _db.Staffs.FindAsync(id);

        public async Task<Staff> AddAsync(Staff staff)
        {
            staff.CreatedAt = DateTime.SpecifyKind(staff.CreatedAt, DateTimeKind.Utc);
            await _db.Staffs.AddAsync(staff);
            await _db.SaveChangesAsync();
            return staff;
        }

        public async Task<IEnumerable<Staff>> GetAllAsync() =>
            await _db.Staffs.ToListAsync();

        public async Task UpdateAsync(Staff staff)
        {
            staff.CreatedAt = DateTime.SpecifyKind(staff.CreatedAt, DateTimeKind.Utc);
            _db.Staffs.Update(staff);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var staff = await _db.Staffs.FindAsync(id);
            if (staff == null) return false;

            _db.Staffs.Remove(staff);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}