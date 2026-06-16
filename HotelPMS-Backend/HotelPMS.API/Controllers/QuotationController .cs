using Microsoft.AspNetCore.Mvc;
using HotelPMS.Domain.Entities;
using HotelPMS.Application.DTOs.Quotation;
using HotelPMS.Application.Interfaces;

namespace HotelPMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuotationController : ControllerBase
    {
        private readonly IQuotationRepository _repo;

        public QuotationController(IQuotationRepository repo)
        {
            _repo = repo;
        }

        [HttpPost]
        public async Task<IActionResult> CreateQuotation([FromBody] CreateQuotationDto dto)
        {
            var result = await _repo.CreateQuotationAsync(dto);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetQuotations()
        {
            var quotations = await _repo.GetAllQuotationsAsync();
            return Ok(quotations);
        }
    }
}