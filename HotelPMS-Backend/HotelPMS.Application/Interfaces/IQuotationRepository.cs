using HotelPMS.Domain.Entities;
using HotelPMS.Application.DTOs.Quotation;

namespace HotelPMS.Application.Interfaces
{
    public interface IQuotationRepository
    {
        Task<QuotationDto> CreateQuotationAsync(CreateQuotationDto dto);
        Task<IEnumerable<Quotation>> GetAllQuotationsAsync();
    }
}