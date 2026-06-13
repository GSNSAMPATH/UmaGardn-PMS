using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using HotelPMS.Domain.Enums;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
namespace HotelPMS.Infrastructure.Repositories;
using HotelPMS.Application.DTOs.Booking;

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _context;
    private readonly IErrorLogRepository _errorLogRepository;


    public BookingRepository(AppDbContext context, IErrorLogRepository errorLogRepository)
    {
        _context = context;
        _errorLogRepository = errorLogRepository;
    }

    // ✅ Check room availability
    public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkin, DateTime checkout)
    {
        return !await _context.BookingRooms
            .Include(br => br.Booking)
            .AnyAsync(br =>
                br.RoomId == roomId &&
                br.Booking.Status != BookingStatus.Cancelled &&   // ✅ must match PostgreSQL enum
                checkin < br.Booking.CheckoutDate &&
                checkout > br.Booking.CheckinDate
            );
    }

    // ✅ Generate booking reference (BK001, BK002...)
    public async Task<string> GenerateBookingRefAsync()
    {
        var last = await _context.Bookings
            .OrderByDescending(b => b.BookingId)
            .FirstOrDefaultAsync();

        int next = 1;

        if (last != null && last.BookingRef.StartsWith("BK"))
        {
            int.TryParse(last.BookingRef.Substring(2), out next);
            next++;
        }

        return $"BK{next:D3}";
    }

    private async Task<string> GenerateGuestCodeAsync()
    {
        var last = await _context.BookingGuests
            .OrderByDescending(g => g.BookingGuestId)
            .FirstOrDefaultAsync();

        int next = last == null ? 1 : last.BookingGuestId + 1;

        return $"G{next:D4}";
    }

    // ✅ Create full booking (booking → guests → rooms → addons → payments)
    public async Task<Booking> CreateFullBookingAsync(CreateBookingDto dto)
    {
        try
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                // ✅ 1. Create booking first
                var booking = new Booking
                {
                    BookingRef = await GenerateBookingRefAsync(),
                    SourceId = dto.SourceId,
                    CheckinDate = dto.CheckinDate,
                    CheckoutDate = dto.CheckoutDate,
                    Adalts = dto.Adalts,
                    Children = dto.Children,
                    Status = BookingStatus.Confirmed,
                    Discount = dto.Discount,
                    CreatedAt = DateTime.UtcNow
                
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync(); // ✅ booking.BookingId now available

                int nights = (dto.CheckoutDate - dto.CheckinDate).Days;

                // ✅ 2. Insert guest(s)
                var existingGuest = await _context.BookingGuests
                    .FirstOrDefaultAsync(g => g.IdType == dto.Guest.IdType && g.IdNumber == dto.Guest.IdNumber);

                BookingGuest guest;

                if (existingGuest != null)
                {
                    guest = existingGuest;

                    // Update guest info if new data provided
                    guest.Name = dto.Guest.Name;
                    guest.Phone = dto.Guest.Phone;
                    guest.Email = dto.Guest.Email;
                    guest.Address = dto.Guest.Address;
                    guest.Country = dto.Guest.Country;

                    // Link to this booking
                    guest.BookingId = booking.BookingId;
                }
                else
                {
                    guest = new BookingGuest
                    {
                        BookingId = booking.BookingId,
                        GuestCode = await GenerateGuestCodeAsync(),   // ✅ generate guest code
                        Name = dto.Guest.Name,
                        IdType = dto.Guest.IdType,
                        IdNumber = dto.Guest.IdNumber,
                        Phone = dto.Guest.Phone,
                        Email = dto.Guest.Email,
                        Address = dto.Guest.Address,
                        Country = dto.Guest.Country
                    };

                    _context.BookingGuests.Add(guest);
                }

                // ✅ 3. Insert rooms
                foreach (var r in dto.Rooms)
                {
                    booking.TotalAmount += r.PricePerNight * nights;

                    _context.BookingRooms.Add(new BookingRoom
                    {
                        BookingId = booking.BookingId,
                        RoomId = r.RoomId,
                        RoomTypeId = r.RoomTypeId,
                        PricePerNight = r.PricePerNight,
                        Nights = nights
                    });
                }

                // ✅ 4. Insert addons
                // ✅ 4a. Insert addons
                foreach (var a in dto.Addons)
                {
                    var addon = await _context.Addons.FindAsync(a.AddonId);
                    if (addon == null) continue;

                    if (addon.ChargeType == AddonChargeType.PerNight)
                        booking.TotalAmount += a.Price * nights;
                    else if (addon.ChargeType == AddonChargeType.PerBooking)
                        booking.TotalAmount += a.Price;

                    _context.BookingAddons.Add(new BookingAddon
                    {
                        BookingId = booking.BookingId,
                        AddonId = a.AddonId,
                        Price = a.Price
                    });
                }

                // ✅ 4b. Insert meal plans
                foreach (var m in dto.MealPlans)
                {

                    int guestsCount = (dto.Adalts ?? 0) + (dto.Children ?? 0);
                        booking.TotalAmount += m.Price * guestsCount * nights;


                    _context.BookingMealPlans.Add(new BookingMealPlan
                    {
                        BookingId = booking.BookingId,
                        MealPlanId = m.MealPlanId,   // now references MealPlan table
                        Price = m.Price
                    });
                }

                // ✅ 4c. Insert discount
                var discount = dto.Discount;
                Console.WriteLine(discount);
                if (discount > 0)
                    booking.TotalAmount -= discount;
                    Console.WriteLine(booking.TotalAmount);
                  

                // ✅ 5. Insert payment
                if (dto.Payment != null)
                {
                    _context.Payments.Add(new Payment
                    {
                        BookingId = booking.BookingId,
                        Amount = dto.Payment.Amount,
                        Method = dto.Payment.Method,
                        TransactionId = dto.Payment.TransactionId,
                        PaymentDate = dto.Payment.PaymentDate,
                        Status = dto.Payment.Status,
                        SubInvoiceNumber = $"SUB-{booking.BookingId}-{DateTime.UtcNow:yyyyMMddHHmmss}"
                    });
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return booking;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CreateBookingAsync", ex);
            throw;
        }

    }

    public async Task<GetBookingDto?> GetBookingByGuestIdAsync(string idType, string idNumber)
    {
        try
        {
            var booking = await _context.Bookings
                .Include(b => b.Guests)
                .Include(b => b.BookingRooms)
                    .ThenInclude(br => br.Room)
                .Include(b => b.BookingAddons)
                    .ThenInclude(ba => ba.Addon)        // join Addon table
                .Include(b => b.BookingMealPlans)
                    .ThenInclude(bm => bm.MealPlan)
                .Include(b => b.Payments)
                .Where(b => b.Guests.Any(g => g.IdType == idType && g.IdNumber == idNumber))
                .FirstOrDefaultAsync();

            if (booking == null)
                return null;

            return new GetBookingDto
            {
                BookingId = booking.BookingId,
                BookingRef = booking.BookingRef,
                SourceId = booking.SourceId,
                CheckinDate = booking.CheckinDate,
                CheckoutDate = booking.CheckoutDate,
                Adalts = booking.Adalts,
                Children = booking.Children,
                Status = booking.Status,
                Discount = booking.Discount,
            
                TotalAmount = booking.TotalAmount,

                Guests = booking.Guests.Select(g => new GuestDto
                {
                    GuestId = g.BookingGuestId,
                    GuestCode = g.GuestCode,
                    Name = g.Name,
                    Phone = g.Phone,
                    Email = g.Email,
                    Address = g.Address, 
                    Country = g.Country
                    
                }).ToList(),

                Rooms = booking.BookingRooms.Select(r => new RoomDto
                {
                    RoomId = r.RoomId,
                    RoomTypeId = r.RoomTypeId,
                    RoomNumber = r.Room.RoomNumber,
                    PricePerNight = r.PricePerNight,
                    Nights = r.Nights
                }).ToList(),

                // ✅ Addons
                Addons = booking.BookingAddons.Select(a => new BookingAddonDto
                {
                    AddonId = a.AddonId,
                    Name = a.Addon.Name,
                    Price = a.Price
                }).ToList(),

                // ✅ MealPlans
                MealPlans = booking.BookingMealPlans.Select(m => new BookingMealPlanDto
                {
                    MealPlanId = m.MealPlanId,
                    Name = m.MealPlan.Name,
                    Price = m.Price
                }).ToList(),

                // ✅ Payments

                Payments = booking.Payments.Select(p => new PaymentResponseDto
                {
                    Amount = p.Amount,
                    Method = p.Method,
                    Status = p.Status,
                    TransactionId = p.TransactionId,
                    PaymentDate = p.PaymentDate,
                    SubInvoiceNumber = p.SubInvoiceNumber
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("GetBookingByGuestIdAsync", ex);
            return null;
            throw;
        }
       
        
    }
    public async Task<Booking?> GetBookingByIdAsync(int bookingId)
    {
        try
        {
            return await _context.Bookings
            .Include(b => b.Guests)
            .Include(b => b.BookingRooms)
                .ThenInclude(br => br.Room)
            .Include(b => b.BookingAddons)
                .ThenInclude(ba => ba.Addon)        // join Addon table
            .Include(b => b.BookingMealPlans)
                .ThenInclude(bm => bm.MealPlan)
            .Include(b => b.Payments)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("GetBookingByIdAsync", ex);
            return null;
            throw;
        }
    }

    public async Task UpdateBookingAsync(Booking booking)
    {
        try
        {
            // Normalize all DateTimes to UTC
            booking.UpdatedAt = DateTime.SpecifyKind(booking.UpdatedAt, DateTimeKind.Utc);

            if (booking.ActualCheckIn.HasValue)
                booking.ActualCheckIn = DateTime.SpecifyKind(booking.ActualCheckIn.Value, DateTimeKind.Utc);

            if (booking.ActualCheckOut.HasValue)
                booking.ActualCheckOut = DateTime.SpecifyKind(booking.ActualCheckOut.Value, DateTimeKind.Utc);

            // If your Booking entity also has CheckinDate/CheckoutDate, normalize them too
            booking.CheckinDate = DateTime.SpecifyKind(booking.CheckinDate, DateTimeKind.Utc);
            booking.CheckoutDate = DateTime.SpecifyKind(booking.CheckoutDate, DateTimeKind.Utc);

            _context.Bookings.Attach(booking);

            _context.Entry(booking).Property(b => b.Status).IsModified = true;
            _context.Entry(booking).Property(b => b.UpdatedAt).IsModified = true;

            if (booking.ActualCheckIn.HasValue)
                _context.Entry(booking).Property(b => b.ActualCheckIn).IsModified = true;

            if (booking.ActualCheckOut.HasValue)
                _context.Entry(booking).Property(b => b.ActualCheckOut).IsModified = true;

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("UpdateBookingAsync", ex);
        }

    }


    public async Task<BookingGuest?> GetBookingGuestAsync(int bookingId)
    {
        try
        {
            return await _context.BookingGuests
                .FirstOrDefaultAsync(g => g.BookingId == bookingId);
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("GetBookingGuestAsync", ex);
            return null;
        }

    }

    public async Task<List<Booking>> GetAllBookingsAsync()
    {
        try
        {
            return await _context.Bookings
                .Include(b => b.Guests)
                .Include(b => b.BookingRooms)
                    .ThenInclude(br => br.Room)
                        .ThenInclude(r => r.RoomType) // if you want room type
                .ToListAsync();
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("GetAllBookingsAsync", ex);
            return new List<Booking>();
            throw;
        }

    }

    public async Task<bool> CheckoutBookingAsync(int bookingId, IEnumerable<PaymentDto> payments, DateTime checkoutTime)
    {
        try
        {           
            var booking = await _context.Bookings
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
            {
                return false;
            }

            var incomingPayments = (payments ?? Enumerable.Empty<PaymentDto>()).ToList();

            var newPayments = new List<Payment>();
            foreach (var req in incomingPayments)
            {


                var p = new Payment
                {
                    BookingId        = booking.BookingId,
                    Amount           = req.Amount,
                    Method           = req.Method,
                    TransactionId    = req.TransactionId,
                    PaymentDate      = req.PaymentDate,
                    Status           = req.Status, 
                    SubInvoiceNumber = $"SUB-{booking.BookingId}-{DateTime.UtcNow:yyyyMMddHHmmss}"
                };

                newPayments.Add(p);
            }


            decimal existingTotal  = booking.Payments.Sum(p => p.Amount);
            decimal incomingTotal  = newPayments.Sum(p => p.Amount);
            decimal subInvoiceTotal = existingTotal + incomingTotal;
            bool hasPaymentsAfter = booking.Payments.Any() || newPayments.Any();
            bool allClosedAfter   = newPayments.All(p => p.Status == PaymentStatus.closed);


            if (booking.SourceId.Equals("WALKIN", StringComparison.OrdinalIgnoreCase) ||
                booking.SourceId.Equals("WALKING", StringComparison.OrdinalIgnoreCase) ||
                booking.SourceId.Equals("WEBSITE", StringComparison.OrdinalIgnoreCase))
            {

                if (!hasPaymentsAfter || !allClosedAfter || subInvoiceTotal != booking.TotalAmount)
                {
                    return false; 
                }
            }

            foreach (var np in newPayments)
            {
                _context.Payments.Add(np);
                booking.Payments.Add(np);
            }

            var invoice = new Invoice
            {
                BookingId     = booking.BookingId,
                InvoiceNumber = $"INV-{booking.BookingId}-{DateTime.UtcNow.Ticks}",
                TotalAmount   = booking.TotalAmount,
                IssuedAt      = checkoutTime
            };
            _context.Invoices.Add(invoice);

            booking.Status        = BookingStatus.CheckedOut;
            booking.ActualCheckOut = checkoutTime;
            booking.UpdatedAt      = checkoutTime;

            await _context.SaveChangesAsync();

            return true;
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CheckoutBookingAsync", ex);
            return false;
        }
    }
    public async Task<string?> GetLatestInvoiceNumberAsync(int bookingId)
    {
        try
        {
            return await _context.Invoices
                .Where(i => i.BookingId == bookingId)
                .OrderByDescending(i => i.IssuedAt)
                .Select(i => i.InvoiceNumber)
                .FirstOrDefaultAsync();
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("GetLatestInvoiceNumberAsync", ex);
            return null;
        }

    }

    public async Task<string?> GetLatestSubInvoiceNumberAsync(int bookingId)
    {
        try
        {
            return await _context.Payments
                .Where(p => p.BookingId == bookingId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => p.SubInvoiceNumber)
                .FirstOrDefaultAsync();
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("GetLatestSubInvoiceNumberAsync", ex);
            return null;
        }
    }
    public async Task<List<BookingGuest>> GetAllBookingGuestsAsync()
    {
        try
        {
            return await _context.BookingGuests.ToListAsync();
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("GetAllBookingGuestsAsync", ex);
            return new List<BookingGuest>();
            throw;
        }
    }

        // ✅ New bookings created in period
    public async Task<int> CountNewBookingsAsync(DateTime start, DateTime end)
    {
        try
        {
            return await _context.Bookings.CountAsync(b => b.CreatedAt >= start && b.CreatedAt < end);
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CountNewBookingsAsync", ex);
            return 0;
            throw;
        }
    }

    // ✅ Check-ins during period
    public async Task<int> CountCheckInsAsync(DateTime start, DateTime end)
    {
        try
        {
            return await _context.Bookings.CountAsync(b => b.ActualCheckIn >= start && b.ActualCheckIn < end);
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CountCheckInsAsync", ex);
            return 0;
            throw;
        }
    }

    // ✅ Check-outs during period
    public async Task<int> CountCheckOutsAsync(DateTime start, DateTime end)
    {
        try
        {
            return await _context.Bookings.CountAsync(b => b.ActualCheckOut >= start && b.ActualCheckOut < end);
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CountCheckOutsAsync", ex);
            return 0;
            throw;
        }
    }
    
    // ✅ Total rooms in hotel
    public async Task<int> CountTotalRoomsAsync()
    {
        try
        {
            return await _context.Rooms.CountAsync();
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CountTotalRoomsAsync", ex);
            return 0;
            throw;
        }
    }

    // Rooms occupied during the period
    public async Task<int> CountRoomsOccupiedAsync(DateTime start, DateTime end)
    {
        try
        {
            return await _context.BookingRooms
            .Include(br => br.Booking)
            .CountAsync(br =>
                br.Booking.Status != BookingStatus.Cancelled &&
                br.Booking.CheckinDate < end &&
                br.Booking.CheckoutDate >= start
            );
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CountRoomsOccupiedAsync", ex);
            return 0;
            throw;
        }

    }

    // Rooms reserved (future bookings starting in this period)
    public async Task<int> CountRoomsReservedAsync(DateTime start, DateTime end)
    {
        try
        {
            return await _context.BookingRooms
            .Include(br => br.Booking)
            .CountAsync(br =>
                br.Booking.Status == BookingStatus.Confirmed &&
                br.Booking.CheckinDate >= start &&
                br.Booking.CheckinDate < end
            );
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CountRoomsReservedAsync", ex);
            return 0;
            throw;
        }

    }

    // Rooms not ready (maintenance or blocked)
    public async Task<int> CountRoomsNotReadyAsync()
    {
        try
        {
            return await _context.Rooms.CountAsync(r => r.Status == RoomStatus.Maintenance);
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("CountRoomsNotReadyAsync", ex);
            return 0;
            throw;
        }
        
    }

    public async Task<int> CountCancelledBookingsAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Bookings
            .Where(b => b.Status == BookingStatus.Cancelled &&
                        b.CancelledAt >= startDate &&
                        b.CancelledAt < endDate)
            .CountAsync();
    }

    // Rooms available = total - occupied
    public async Task<int> CountRoomsAvailableAsync(DateTime start, DateTime end)
    {
        int totalRooms = await _context.Rooms.CountAsync();
        int occupied = await CountRoomsOccupiedAsync(start, end);
        return totalRooms - occupied;
    }
    public async Task<decimal> GetRevenueAsync(DateTime startDate, DateTime endDate)
    {
        try
        {
            return await _context.Payments
            .Where(p => p.PaymentDate >= startDate && p.PaymentDate < endDate)
            .Select(p => (decimal?)p.Amount)
            .SumAsync() ?? 0m;
        }
        catch(Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("GetRevenueAsync", ex);
            return 0m;
            throw;
        }

    }

    public async Task<bool> CancelBookingAsync(int bookingId, decimal refundAmount)
    {
        try
        {
            var booking = await _context.Bookings
                .Include(b => b.Payments)
                .Include(b => b.BookingRooms)
                .ThenInclude(br => br.Room)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null) return false;

            // ✅ 1) Prevent re-cancel
            if (booking.Status == BookingStatus.Cancelled)
                return false;

            // ✅ 2) Prevent cancelling after check-in / check-out
            // (adjust rules if your business allows cancellation after check-in)
            if (booking.Status == BookingStatus.CheckedIn || booking.Status == BookingStatus.CheckedOut)
                return false;

            // ✅ 3) Validate refund amount (no negative refund)
            if (refundAmount < 0)
                return false;

            // ✅ 4) Optional: prevent refund larger than paid amount
            // Paid amount = only closed/paid payments (ignore previous refunds)
            var paidAmount = booking.Payments
                .Where(p => p.Status == PaymentStatus.closed && p.Amount > 0)
                .Sum(p => p.Amount);

            // if (refundAmount > paidAmount)
            //     return false;

            booking.Status = BookingStatus.Cancelled;
            booking.CancelledAt = DateTime.UtcNow;

            // ✅ 5) Add refund payment only if refundAmount > 0
            if (refundAmount > 0)
            {
                var refundPayment = new Payment
                {
                    BookingId        = booking.BookingId,
                    Amount           = -refundAmount,
                    PaymentDate      = DateTime.UtcNow,
                    TransactionId    = $"REF-{booking.BookingId}-{Guid.NewGuid():N}",
                    Status           = PaymentStatus.Refunded,
                    SubInvoiceNumber = $"REF-{booking.BookingId}-{DateTime.UtcNow:yyyyMMddHHmmss}"
                };

                _context.Payments.Add(refundPayment);
            }

            // ✅ 6) Remove all booking rooms
            foreach (var bookingRoom in booking.BookingRooms)
            {
                _context.BookingRooms.Remove(bookingRoom);
            }

            // ✅ Update only needed columns
            _context.Attach(booking);
            _context.Entry(booking).Property(b => b.Status).IsModified = true;
            _context.Entry(booking).Property(b => b.CancelledAt).IsModified = true;

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync(
                "CancelBooking",
                ex,
                new { bookingId, refundAmount }
            );

            throw; // ✅ keep original error + stacktrace
        }
    }


    public async Task<IEnumerable<object>> GetBookingSourceStatsAsync(int year, int? month = null)
    {
        try
        {
            var query = _context.Bookings
            .Where(b => b.CreatedAt.Year == year);

            if (month.HasValue)
            {
                query = query.Where(b => b.CreatedAt.Month == month.Value);
            }

            var result = await query
                .GroupBy(b => b.SourceId)
                .Select(g => new 
                {
                    Name = g.Key,
                    Value = g.Count()
                })
                .ToListAsync();

            return result;
        }
        catch (Exception ex)
        {

            await _errorLogRepository.LogErrorAsync(
                "GetBookingSourceStats",
                ex,
                new { year, month }
            );
            
            throw;
        }
        
    }

}
