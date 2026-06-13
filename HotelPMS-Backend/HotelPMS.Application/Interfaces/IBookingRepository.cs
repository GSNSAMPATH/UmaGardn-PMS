using HotelPMS.Domain.Entities;
using HotelPMS.Application.DTOs;
using HotelPMS.Application.DTOs.Booking;



namespace HotelPMS.Application.Interfaces;

public interface IBookingRepository
{
    Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkin, DateTime checkout);
    Task<string> GenerateBookingRefAsync();
    Task<Booking> CreateFullBookingAsync(CreateBookingDto dto);
    // Task<GetBookingDto?> GetByIdAsync(int id);
    Task<GetBookingDto?> GetBookingByGuestIdAsync(string idType, string idNumber);

    Task<Booking?> GetBookingByIdAsync(int bookingId);
    
    Task UpdateBookingAsync(Booking booking);

    Task<List<Booking>> GetAllBookingsAsync();

    Task<bool> CheckoutBookingAsync(int bookingId, IEnumerable<PaymentDto> payments, DateTime checkoutTime);

    Task<BookingGuest?> GetBookingGuestAsync(int bookingId);

    Task<List<BookingGuest>> GetAllBookingGuestsAsync();

    // Task AddInvoiceAsync(Invoice invoice);

    // Task UpdatePaymentsAsync(IEnumerable<Payment> payments);

    Task<string?> GetLatestInvoiceNumberAsync(int bookingId);
    Task<string?> GetLatestSubInvoiceNumberAsync(int bookingId);

    Task<int> CountNewBookingsAsync(DateTime start, DateTime end);
    Task<int> CountCheckInsAsync(DateTime start, DateTime end);
    Task<int> CountCheckOutsAsync(DateTime start, DateTime end);

    Task<int> CountTotalRoomsAsync();
    Task<int> CountRoomsOccupiedAsync(DateTime start, DateTime end);
    Task<int> CountRoomsReservedAsync(DateTime start, DateTime end);
    Task<int> CountRoomsAvailableAsync(DateTime start, DateTime end);
    Task<int> CountRoomsNotReadyAsync();
    Task<int> CountCancelledBookingsAsync(DateTime startDate, DateTime endDate);
    Task<decimal> GetRevenueAsync(DateTime startDate, DateTime endDate);
    Task<bool> CancelBookingAsync(int bookingId, decimal refundAmount);
    Task<IEnumerable<object>> GetBookingSourceStatsAsync(int year, int? month = null);

}