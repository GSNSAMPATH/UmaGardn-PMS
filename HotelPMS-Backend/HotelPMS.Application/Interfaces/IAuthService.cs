using HotelPMS.Domain.Entities;
using System.Threading.Tasks;

namespace HotelPMS.Application.Interfaces
{
    public interface IAuthService
    {
        Task<Staff?> ValidateUserAsync(string email, string password);
        string GenerateJwtToken(Staff staff); // must be implemented
        string HashPassword(string password);
    }
}
