using HotelPMS.Application.DTOs.Auth;
using HotelPMS.Application.DTOs;
using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HotelPMS.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IStaffRepository _staffRepository;
        private readonly IConfiguration _config;

        public AuthController(IStaffRepository staffRepository, IConfiguration config)
        {
            _staffRepository = staffRepository;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            // ✅ fetch staff by email
            var user = await _staffRepository.GetByEmailAsync(req.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            // ✅ verify password (replace with BCrypt if needed)
            if (!VerifyPassword(req.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials" });

            // ✅ generate JWT
            var token = GenerateJwtToken(user);

            // ✅ return full response including profileImageUrl
            return Ok(new
            {
                token,
                name = user.Name,
                role = user.Role,
                profileImageUrl = user.ProfileImageUrl
            });
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            // Simplified: base64 decode check
            var plain = Encoding.UTF8.GetString(Convert.FromBase64String(storedHash));
            return plain == password;
        }

        private string GenerateJwtToken(Staff staff)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, staff.StaffId.ToString()),
                new Claim(ClaimTypes.Name, staff.Name),
                new Claim(ClaimTypes.Email, staff.Email),
                new Claim(ClaimTypes.Role, staff.Role.ToString())
            };

            var jwtKey = _config["Jwt:Key"] ?? throw new Exception("JWT Key is missing in configuration.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}