using HotelPMS.Infrastructure.Data;  // ✅ points to AppDbContext
using Microsoft.EntityFrameworkCore;
using HotelPMS.Domain.Entities;  // ✅ add this

using System.Text.Json;
public class ErrorLogRepository : IErrorLogRepository
{
    private readonly AppDbContext _context;

    public ErrorLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogErrorAsync(string transactionName, Exception ex, object? transactionData = null)
    {
        var log = new ErrorLog
        {
            TransactionName = transactionName,
            Message = ex.Message,
            StackTrace = ex.StackTrace,
            Data = transactionData != null 
                ? JsonSerializer.Serialize(transactionData) 
                : null
        };

        _context.ErrorLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<ErrorLog>> GetAllLogsAsync()
        => await _context.ErrorLogs.OrderByDescending(l => l.Date).ToListAsync();

    public async Task<IEnumerable<ErrorLog>> GetLogsByDateAsync(DateTime date)
        => await _context.ErrorLogs
            .Where(l => l.Date.Date == date.Date)
            .OrderByDescending(l => l.Date)
            .ToListAsync();
}