using HotelPMS.Application.DTOs;
using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HotelPMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CountryController : ControllerBase
    {
        private readonly ICountryRepository _repo;

        public CountryController(ICountryRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var countries = await _repo.GetAllAsync();
            var response = countries.Select(c => new CountryDto
            {
                CountryId = c.CountryId,
                Name = c.Name,
                Code = c.Code
            });
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var country = await _repo.GetByIdAsync(id);
            if (country == null) return NotFound();

            return Ok(new CountryDto
            {
                CountryId = country.CountryId,
                Name = country.Name,
                Code = country.Code
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCountryDto dto)
        {
            var country = new Country
            {
                Name = dto.Name,
                Code = dto.Code
            };

            var created = await _repo.AddAsync(country);
            return CreatedAtAction(nameof(GetById), new { id = created.CountryId }, created);
        }

    }
}