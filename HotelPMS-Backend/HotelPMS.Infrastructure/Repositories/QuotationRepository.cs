using HotelPMS.Application.Interfaces;
using HotelPMS.Application.DTOs.Quotation;
using HotelPMS.Domain.Entities;
using HotelPMS.Domain.Enums;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public class QuotationRepository : IQuotationRepository
{
    private readonly AppDbContext _context;
    private readonly IErrorLogRepository _errorLogRepository;

    public QuotationRepository(AppDbContext context, IErrorLogRepository errorLogRepository)
    {
        _context = context;
        _errorLogRepository = errorLogRepository;
    }

    public async Task<QuotationDto> CreateQuotationAsync(CreateQuotationDto dto)
    {
        try
        {
            int nights = (dto.CheckoutDate - dto.CheckinDate).Days;
            if (nights <= 0) nights = 1;

            var quotation = new Quotation
            {
                Name = dto.Name,
                IdType = dto.IdType,
                IdNumber = dto.IdNumber,
                Phone = dto.Phone,
                CheckinDate = dto.CheckinDate,
                CheckoutDate = dto.CheckoutDate,
                Adults = dto.Adults,     // ✅ set here
                Children = dto.Children, // ✅ set here
                MealPlanId = dto.MealPlanId,
                AddonId = dto.AddonId,
                TotalAmount = 0,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var r in dto.Rooms)
            {
                var room = await _context.Rooms
                    .Include(rt => rt.RoomType)
                    .FirstOrDefaultAsync(x => x.RoomId == r.RoomId);

                if (room?.RoomType != null)
                {
                    quotation.TotalAmount += room.RoomType.BasePrice * nights;

                    quotation.QuotationRooms.Add(new QuotationRoom
                    {
                        RoomId = r.RoomId,
                        RoomTypeId = r.RoomTypeId
                    });
                }
            }

            var addon = await _context.Addons.FindAsync(dto.AddonId);
            if (addon != null)
            {
                quotation.TotalAmount += addon.ChargeType == AddonChargeType.PerNight
                    ? addon.Price * nights
                    : addon.Price;
            }

            var mealPlan = await _context.MealPlans.FindAsync(dto.MealPlanId);
            if (mealPlan != null)
            {
                int guestsCount = dto.Adults + dto.Children;

                quotation.TotalAmount += mealPlan.Price * guestsCount * nights;
            }

            if (dto.Discount > 0)
                quotation.TotalAmount -= dto.Discount;

            _context.Quotations.Add(quotation);
            await _context.SaveChangesAsync();

            // ✅ Return DTO instead of EF entity
            return new QuotationDto
            {
                Id = quotation.Id,
                Name = quotation.Name,
                CheckinDate = quotation.CheckinDate,
                CheckoutDate = quotation.CheckoutDate,
                TotalAmount = quotation.TotalAmount,
                Rooms = quotation.QuotationRooms.Select(qr => new RoomSelectionDto
                {
                    RoomId = qr.RoomId,
                    RoomTypeId = qr.RoomTypeId
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CreateQuotationAsync", ex, dto);
            throw;
        }
    }
    public async Task<IEnumerable<Quotation>> GetAllQuotationsAsync()
    {
        return await _context.Quotations
            .OrderByDescending(q => q.CheckinDate)
            .ToListAsync();
    }
}