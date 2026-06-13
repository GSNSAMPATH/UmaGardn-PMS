using HotelPMS.Domain.Entities; 

public interface IErrorLogRepository
{
    Task LogErrorAsync(string transactionName, Exception ex, object? transactionData = null);
    Task<IEnumerable<ErrorLog>> GetAllLogsAsync();
    Task<IEnumerable<ErrorLog>> GetLogsByDateAsync(DateTime date);
}