using HotelPMS.Application.Interfaces;
using HotelPMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HotelPMS.Application.DTOs;
using HotelPMS.Application.Services;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using HotelPMS.Domain.Enums;

namespace HotelPMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly IBookingRepository _repo;
    private readonly EmailService _emailService;

    private readonly IErrorLogRepository _errorLogRepository;

    public BookingController(IBookingRepository repo, EmailService emailService, IErrorLogRepository errorLogRepository)
    {
        _repo = repo;
        _emailService = emailService;
        _errorLogRepository = errorLogRepository;

    }


    [HttpGet]
    public async Task<IActionResult> GetAllBookings()
    {
        var bookings = await _repo.GetAllBookingsAsync();
        return Ok(bookings);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        foreach (var room in dto.Rooms)
        {
            bool available = await _repo.IsRoomAvailableAsync(
                room.RoomId,
                dto.CheckinDate,
                dto.CheckoutDate
            );

            if (!available)
                return BadRequest($"Room {room.RoomId} is not available.");
        }

        var booking = await _repo.CreateFullBookingAsync(dto);
        var payment = booking.Payments.FirstOrDefault();

        string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Emails", "BookingConfirmation.html");
        string emailTemplate = await System.IO.File.ReadAllTextAsync(templatePath);

        string emailBody = emailTemplate
            .Replace("{{GuestName}}", dto.Guest.Name)
            .Replace("{{BookingRef}}", booking.BookingRef)
            .Replace("{{CheckInDate}}", booking.CheckinDate.ToString("dd MMM yyyy"))
            .Replace("{{CheckOutDate}}", booking.CheckoutDate.ToString("dd MMM yyyy"))
            .Replace("{{TotalGuests}}", ((dto.Adalts ?? 0) + (dto.Children ?? 0)).ToString())
            .Replace("{{TotalAmount}}", booking.TotalAmount.ToString("F2"))
            .Replace("{{SubInvoiceNumber}}", payment?.SubInvoiceNumber ?? "")
            .Replace("{{PaymentDate}}", payment?.PaymentDate.ToString("dd MMM yyyy"))
            .Replace("{{Amount}}", payment?.Amount.ToString("F2"))
            .Replace("{{Method}}", payment != null ? payment.Method.ToString() : "")
            .Replace("{{TransactionId}}", payment?.TransactionId ?? "")
            .Replace("{{Year}}", DateTime.UtcNow.Year.ToString());


         // ✅ Send email
        try
        {
#pragma warning disable CS8604 // Possible null reference argument.
            await _emailService.SendEmailAsync(dto.Guest.Email, "Your Booking Confirmation", emailBody);
#pragma warning restore CS8604 // Possible null reference argument.
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("SendEmailAsync", ex);
        }

        return Ok(new
        {
            booking.BookingId,
            booking.BookingRef,
            booking.TotalAmount,
            booking.Status,
            booking.CheckinDate,
            booking.CheckoutDate,
            dto.Guest.Name,
            payment.SubInvoiceNumber,
            payment.PaymentDate,
            payment.Method,
            payment.Amount

        });
    }


    [HttpGet("guest")]
    public async Task<IActionResult> GetBookingByGuest(string idType, string idNumber)
    {
        var result = await _repo.GetBookingByGuestIdAsync(idType, idNumber);
        if (result == null)
            return NotFound("No booking found for this guest.");

        return Ok(result);
    }


    [HttpPost("check-in/{bookingId}")]
    public async Task<IActionResult> CheckIn(int bookingId)
    {
        var booking = await _repo.GetBookingByIdAsync(bookingId);
        if (booking == null)
            return NotFound($"Booking {bookingId} not found.");

        var now = DateTime.UtcNow;

        if (now < booking.CheckinDate)
            return BadRequest("Guest cannot check in before the reservation start date.");

        booking.Status = BookingStatus.CheckedIn;
        booking.ActualCheckIn = now;
        booking.UpdatedAt = now;

        await _repo.UpdateBookingAsync(booking);

        // ✅ Build check-in confirmation email
        string emailTemplate = await System.IO.File.ReadAllTextAsync(
            Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Emails", "CheckInConfirmation.html")
        );

        var primaryGuest = booking.Guests.FirstOrDefault();

        string guestName = primaryGuest?.Name ?? "";
        string guestEmail = primaryGuest?.Email ?? "";

        string roomNumbers = booking.BookingRooms != null
            ? string.Join(", ", booking.BookingRooms
                .Where(br => br.Room != null)
                .Select(br => br.Room.RoomNumber))
            : string.Empty;

;
        decimal advanceAmount = booking.Payments
            .Where(p => p.Status == PaymentStatus.advance)
            .Sum(p => p.Amount);

        string emailBody = emailTemplate
            .Replace("{{GuestName}}", primaryGuest?.Name ?? "")
            .Replace("{{BookingRef}}", booking.BookingRef)
            .Replace("{{CheckInDate}}", booking.CheckinDate.ToString("dd MMM yyyy"))
            .Replace("{{CheckOutDate}}", booking.CheckoutDate.ToString("dd MMM yyyy"))
            .Replace("{{TotalGuests}}", ((booking.Adalts ?? 0) + (booking.Children ?? 0)).ToString())
            .Replace("{{ActualCheckIn}}", booking.ActualCheckIn?.ToString("dd MMM yyyy HH:mm") ?? "")
            .Replace("{{RoomNumbers}}", roomNumbers)
            .Replace("{{AdvanceAmount}}", advanceAmount.ToString("F2"))
            .Replace("{{Year}}", DateTime.UtcNow.Year.ToString());

        // ✅ Send email
        if (!string.IsNullOrEmpty(guestEmail))
        {
            try
            {
                await _emailService.SendEmailAsync(guestEmail,"Check-in Confirmation",emailBody);
            }
            catch(Exception ex)
            {
                await _errorLogRepository.LogErrorAsync("SendEmailAsync", ex);
            }

        }
        else
        {
            Console.WriteLine("Guest email is empty.");
        }

        return Ok(new
        {
            booking.BookingId,
            booking.BookingRef,
            booking.Status,
            booking.ActualCheckIn
        });
    }

    [HttpPost("check-out")]
    public async Task<IActionResult> CheckOut([FromBody] CheckoutDto request)
    {
        var now = DateTime.UtcNow;
        var success = await _repo.CheckoutBookingAsync(request.BookingId, request.Payments, now);

        if (!success)
            return BadRequest($"Checkout failed for Booking {request.BookingId}. Validation did not pass.");

        // ✅ Fetch booking for response
        var booking = await _repo.GetBookingByIdAsync(request.BookingId);

        // ✅ Load check-out confirmation email template
        string emailTemplate = await System.IO.File.ReadAllTextAsync(
            Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Emails", "CheckOutConfirmation.html")
        );

        var primaryGuest = booking.Guests.FirstOrDefault();
        string guestName = primaryGuest?.Name ?? "";
        string guestEmail = primaryGuest?.Email ?? "";

        string roomNumbers = booking.BookingRooms != null
            ? string.Join(", ", booking.BookingRooms
                .Where(br => br.Room != null)
                .Select(br => br.Room.RoomNumber))
            : string.Empty;

        decimal advanceAmount = booking.Payments
            .Where(p => p.Status == PaymentStatus.advance)
            .Sum(p => p.Amount);

        decimal mealPlanAmount = booking.BookingMealPlans != null
            ? booking.BookingMealPlans
                .Where(bmp => bmp.MealPlan != null)
                .Sum(bmp => bmp.MealPlan.Price)
            : 0;

        Console.WriteLine($"Meal Plan Amount: {mealPlanAmount}");

        decimal totalAmount = booking.TotalAmount;
        int totalNights = (booking.CheckoutDate - booking.CheckinDate).Days;

        // ✅ Get latest sub-invoice number from payments
        string subInvoiceNumber = booking.Payments.LastOrDefault()?.SubInvoiceNumber ?? "";

        // ✅ Get invoice number from repository
        string invoiceNumber = await _repo.GetLatestInvoiceNumberAsync(booking.BookingId) ?? "";

        // ✅ Replace placeholders in template
        string emailBody = emailTemplate
            .Replace("{{GuestName}}", guestName)
            .Replace("{{BookingRef}}", booking.BookingRef)
            .Replace("{{CheckInDate}}", booking.CheckinDate.ToString("dd MMM yyyy"))
            .Replace("{{CheckOutDate}}", booking.CheckoutDate.ToString("dd MMM yyyy"))
            .Replace("{{ActualCheckOut}}", booking.ActualCheckOut?.ToString("dd MMM yyyy HH:mm") ?? "")
            .Replace("{{TotalGuests}}", ((booking.Adalts ?? 0) + (booking.Children ?? 0)).ToString())
            .Replace("{{RoomNumbers}}", roomNumbers)
            .Replace("{{TotalNights}}", totalNights.ToString())
            .Replace("{{TotalAmount}}", totalAmount.ToString("F2"))
            .Replace("{{SubInvoiceNumber}}", subInvoiceNumber)
            .Replace("{{AdvanceAmount}}", advanceAmount.ToString("F2"))
            .Replace("{{InvoiceNumber}}", invoiceNumber)
            .Replace("{{Year}}", DateTime.UtcNow.Year.ToString());

        // ✅ Send email
        if (!string.IsNullOrEmpty(guestEmail))
        {
            try
            {
                await _emailService.SendEmailAsync(guestEmail,"Check-out Confirmation",emailBody);
            }
            catch(Exception ex)
            {
                await _errorLogRepository.LogErrorAsync("SendEmailAsync", ex);
            }

        }
        else
        {
            Console.WriteLine("Guest email is empty.");
        }

        return Ok(new
        {
            booking.BookingId,
            booking.BookingRef,
            booking.Status,
            booking.ActualCheckIn,
            booking.ActualCheckOut,
            roomNumbers,
            totalNights,
            totalAmount = booking.TotalAmount,
            subInvoiceNumber,
            advanceAmount,
            invoiceNumber,
            mealPlanAmount 
        });
    }


    [HttpGet("calendar")]
    public async Task<IActionResult> GetCalendarBookings([FromQuery] int month, [FromQuery] int year)
    {
        var bookings = await _repo.GetAllBookingsAsync();

        var filtered = bookings
            .Where(b =>
                (b.CheckinDate.Month == month && b.CheckinDate.Year == year) ||
                (b.CheckoutDate.Month == month && b.CheckoutDate.Year == year) // include overlaps
            )
            .SelectMany(b => b.BookingRooms.Select(br => new
            {
                roomId     = br.RoomId,
                roomNumber = br.Room?.RoomNumber ?? "",
                roomType   = br.Room?.RoomType.Name ?? "",
                checking   = b.CheckinDate.ToString("yyyy-MM-dd"),
                checkout   = b.CheckoutDate.ToString("yyyy-MM-dd"),
                booking_ref = b.BookingRef,
                status     = b.Status.ToString().ToLower(),
                guestName  = b.Guests.FirstOrDefault()?.Name ?? "",
                mealPlan   = b.BookingMealPlans.FirstOrDefault()?.MealPlan.Name ?? "",
                total      = b.TotalAmount
            }))
            .ToList();

        return Ok(filtered);
    }

    [HttpGet("guest-management")]
    public async Task<IActionResult> GetGuestManagementData(
        [FromQuery] int month,
        [FromQuery] int year,
        [FromQuery] string? status = null)   // optional status filter
    {
        var bookings = await _repo.GetAllBookingsAsync();

        var filtered = bookings
            .Where(b =>
                (b.CheckinDate.Month == month && b.CheckinDate.Year == year) ||
                (b.CheckoutDate.Month == month && b.CheckoutDate.Year == year)
            );

        // ✅ Apply status filter only if provided
        if (!string.IsNullOrEmpty(status))
        {
            filtered = filtered.Where(b => b.Status.ToString().Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        var result = filtered
            .Select(b => new
            {
                id = b.BookingId,
                b.BookingRef,
                guestName = b.Guests.FirstOrDefault()?.Name ?? "",
                phone = b.Guests.FirstOrDefault()?.Phone ?? "",
                email = b.Guests.FirstOrDefault()?.Email ?? "",
                roomNumber = b.BookingRooms.FirstOrDefault()?.Room?.RoomNumber ?? "",
                roomType = b.BookingRooms.FirstOrDefault()?.Room?.RoomType?.Name ?? "",
                checkIn = b.CheckinDate.ToString("yyyy-MM-dd"),
                checkOut = b.CheckoutDate.ToString("yyyy-MM-dd"),
                status = b.Status.ToString(),
                adults = b.Adalts ?? 0,
                children = b.Children ?? 0,
                nights = (int)(b.CheckoutDate - b.CheckinDate).TotalDays,
                total = b.TotalAmount
            })
            .ToList();

        return Ok(result);
    }
    [HttpGet("booking-guests")]
    public async Task<IActionResult> GetAllBookingGuests()
    {
        var guests = await _repo.GetAllBookingGuestsAsync();

        var result = guests.Select(g => new
        {
            g.BookingGuestId,
            g.GuestCode,
            g.BookingId,
            g.Name,
            g.Address,
            g.Country,
            g.Email,
            g.Phone,
            g.IdType,
            g.IdNumber
        });

        return Ok(result);
    }

    [HttpPost("send-email")]
    public async Task<IActionResult> SendEmail([FromBody] EmailRequestDto request)
    {
        try
        {
            var attachments = request.Attachments?.Select(a =>
            (a.FileName, Convert.FromBase64String(a.ContentBase64), a.ContentType)
            ).ToList();

            await _emailService.SendEmailAsync(request.To, request.Subject, request.Body, attachments);

            return Ok(new { Sent = true, To = request.To, Subject = request.Subject, AttachmentsCount = attachments?.Count ?? 0 });
        }
        catch (Exception ex)
        {
            await _errorLogRepository.LogErrorAsync("SendEmailAsync", ex);
            return BadRequest(new { Sent = false, Error = ex.Message });
        }
    }

    [HttpPut("cancel")]
    public async Task<IActionResult> CancelBooking([FromQuery] int bookingId, [FromQuery] decimal refundAmount)
    {
        var success = await _repo.CancelBookingAsync(bookingId, refundAmount);

        if (!success)
        {
            return BadRequest(new { Message = "Failed to cancel booking" });
        }

        var booking = await _repo.GetBookingByIdAsync(bookingId);

        if (booking == null)
        {
            return NotFound(new { Message = $"Booking {bookingId} not found." });
        }

        string emailTemplate = await System.IO.File.ReadAllTextAsync(
        Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Emails", "CancelBookingConfirmation.html")
        );
        var primaryGuest = booking.Guests?.FirstOrDefault();
        string guestName = primaryGuest?.Name ?? "";
        string guestEmail = primaryGuest?.Email ?? "";

        string roomNumbers = booking.BookingRooms != null
            ? string.Join(", ", booking.BookingRooms
                .Where(br => br.Room != null)
                .Select(br => br.Room.RoomNumber))
            : string.Empty;

        int totalNights = (booking.CheckoutDate - booking.CheckinDate).Days;

        // ✅ refund reference (only if refundAmount > 0)
        string refundRef = booking.Payments?
            .Where(p => p.Status == PaymentStatus.Refunded)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => p.SubInvoiceNumber)
            .FirstOrDefault() ?? "";

        string emailBody = emailTemplate
            .Replace("{GuestName}", guestName)
            .Replace("{GuestEmail}", guestEmail)
            .Replace("{RoomNumbers}", roomNumbers)
            .Replace("{CheckinDate}", booking.CheckinDate.ToString("yyyy-MM-dd"))
            .Replace("{CheckoutDate}", booking.CheckoutDate.ToString("yyyy-MM-dd"))
            .Replace("{TotalNights}", totalNights.ToString())
            .Replace("{RefundAmount}", refundAmount.ToString("C"))
            .Replace("{RefundRef}", refundRef);
        // return Ok(new { Message = $"Booking {bookingId} cancelled successfully. Refund of {refundAmount} recorded." });

        if(!string.IsNullOrEmpty(guestEmail) && !string.IsNullOrEmpty(guestEmail))
        {
            try
            {
                await _emailService.SendEmailAsync(guestEmail, "Your booking has been cancelled", emailBody);
            }
            catch (Exception ex)
            {
                await _errorLogRepository.LogErrorAsync("SendEmailAsync", ex, new { bookingId, guestEmail, refundAmount });
            }
            
        }

        return Ok(new
        {
            Message = $"Booking {bookingId} cancelled successfully.",
            booking.BookingId,
            booking.BookingRef,
            booking.Status,
            booking.CancelledAt,
            roomNumbers,
            totalNights,
            refundAmount,
            refundRef
        });

    }

}