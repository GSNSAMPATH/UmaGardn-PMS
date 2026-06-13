using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HotelPMS.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string HashPassword(string password)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(password));
        }

        public async Task<Staff?> ValidateUserAsync(string email, string password)
        {
            var hashedPassword = HashPassword(password);

            if (email == "admin@example.com" && hashedPassword == HashPassword("password123"))
            {
                return await Task.FromResult(new Staff
                {
                    StaffId = 1,
                    Name = "Admin User",
                    Email = email,
                    Role = StaffRole.Admin,   // ✅ enum
                    PasswordHash = hashedPassword
                });
            }

            return await Task.FromResult<Staff?>(null);
        }

        public string GenerateJwtToken(Staff staff)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, staff.StaffId.ToString()),
                new Claim(ClaimTypes.Name, staff.Name),
                new Claim(ClaimTypes.Email, staff.Email),
                new Claim(ClaimTypes.Role, staff.Role.ToString()) // ✅ convert enum to string
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}