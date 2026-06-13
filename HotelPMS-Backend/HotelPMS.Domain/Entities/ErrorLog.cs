namespace HotelPMS.Domain.Entities
{
    public class ErrorLog
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string TransactionName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? StackTrace { get; set; }
        public string? Data { get; set; }
    }
}