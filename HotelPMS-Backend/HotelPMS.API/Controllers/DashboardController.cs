using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HotelPMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IBookingRepository _repo;

    public DashboardController(IBookingRepository repo)
    {
        _repo = repo;
    }

   [HttpGet]
    public async Task<IActionResult> GetDashboardStats(
        [FromQuery] string period,
        [FromQuery] int year,
        [FromQuery] int? month,
        [FromQuery] int? week,
        [FromQuery] int? day
        )
    {
        DateTime startDate, endDate;

        if (period.ToLower() == "month" && month.HasValue)
        {
            startDate = new DateTime(year, month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
            endDate = startDate.AddMonths(1);
        }
        else if (period.ToLower() == "week" && week.HasValue)
        {
            var jan1 = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            int daysOffset = DayOfWeek.Monday - jan1.DayOfWeek;
            var firstMonday = jan1.AddDays(daysOffset);
            startDate = firstMonday.AddDays((week.Value - 1) * 7);
            endDate = startDate.AddDays(7);
        }
        else if (period.ToLower() == "day" && month.HasValue && day.HasValue)
        {
            startDate = new DateTime(year, month.Value, day.Value, 0, 0, 0, DateTimeKind.Utc);
            endDate = startDate.AddDays(1);
        }
        else
        {
            return BadRequest("Invalid headers. Use 'month' with year+month or 'week' with year+week.");
        }

        // Current period stats
        int newBookings = await _repo.CountNewBookingsAsync(startDate, endDate);
        int checkIns = await _repo.CountCheckInsAsync(startDate, endDate);
        int checkOuts = await _repo.CountCheckOutsAsync(startDate, endDate);

        int totalRooms = await _repo.CountTotalRoomsAsync();
        int roomsOccupied = await _repo.CountRoomsOccupiedAsync(startDate, endDate);
        int reserved = await _repo.CountRoomsReservedAsync(startDate, endDate);
        int roomsAvailable = await _repo.CountRoomsAvailableAsync(startDate, endDate);
        int notReady = await _repo.CountRoomsNotReadyAsync();
        int cancelledBookings = await _repo.CountCancelledBookingsAsync(startDate, endDate);

        // Previous period comparison
        DateTime prevStart = period == "month"
            ? startDate.AddMonths(-1)
            : startDate.AddDays(-7);
        DateTime prevEnd = startDate;

        int newBookingsLastPeriod = await _repo.CountNewBookingsAsync(prevStart, prevEnd);
        int checkInsLastPeriod = await _repo.CountCheckInsAsync(prevStart, prevEnd);
        int checkOutsLastPeriod = await _repo.CountCheckOutsAsync(prevStart, prevEnd);
        int roomsAvailableLastPeriod = await _repo.CountRoomsAvailableAsync(prevStart, prevEnd);
        int cancelledBookingsLastPeriod = await _repo.CountCancelledBookingsAsync(prevStart, prevEnd);

        return Ok(new
        {
            newBookings,
            checkIns,
            checkOuts,
            roomsAvailable,
            totalRooms,
            roomsOccupied,
            cancelledBookings, 
            notReady,
            newBookingsLastPeriod,
            checkInsLastPeriod,
            checkOutsLastPeriod,
            roomsAvailableLastPeriod,
            cancelledBookingsLastPeriod
        });
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenueStats(
        [FromQuery] string period,
        [FromQuery] int year,
        [FromQuery] int? month,
        [FromQuery] int? week,
        [FromQuery] int? day)
    {
        DateTime startDate, endDate;

        if (period.ToLower() == "day" && month.HasValue && day.HasValue)
        {
            // Daily revenue
            startDate = new DateTime(year, month.Value, day.Value, 0, 0, 0, DateTimeKind.Utc);
            endDate = startDate.AddDays(1);
        }
        else if (period.ToLower() == "month" && month.HasValue)
        {
            // Monthly revenue
            startDate = new DateTime(year, month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
            endDate = startDate.AddMonths(1);
        }
        else if (period.ToLower() == "week" && month.HasValue && week.HasValue)
        {
            // Weekly revenue (week number relative to month)
            var firstDayOfMonth = new DateTime(year, month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
            startDate = firstDayOfMonth.AddDays((week.Value - 1) * 7);
            endDate = startDate.AddDays(7);
        }
        else
        {
            return BadRequest("Invalid period. Use 'day' with year+month+day, 'month' with year+month, or 'week' with year+month+week.");
        }

        var totalRevenue = await _repo.GetRevenueAsync(startDate, endDate);

        return Ok(new
        {
            Revenue = totalRevenue
        });
    }

    [HttpGet("monthly-revenue")]
    public async Task<IActionResult> GetMonthlyRevenue([FromQuery] int year)
    {
        var monthlyData = new List<object>();

        for (int month = 1; month <= 12; month++)
        {
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1);

            var revenue = await _repo.GetRevenueAsync(startDate, endDate);

            monthlyData.Add(new
            {
                Month = startDate.ToString("MMM").ToUpper(), // JAN, FEB, etc.
                Revenue = revenue
            });
        }

        return Ok(monthlyData);
    }  

    [HttpGet("source-stats")]
    public async Task<IActionResult> GetSourceStats(int year, int? month)
    {
        var stats = await _repo.GetBookingSourceStatsAsync(year, month);
        return Ok(new {
            month = month.HasValue 
                ? new DateTime(year, month.Value, 1).ToString("MMMM yyyy") 
                : $"Year {year}",
            sources = stats
        });
    }
}