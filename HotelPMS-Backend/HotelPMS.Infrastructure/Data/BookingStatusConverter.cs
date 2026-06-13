using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using HotelPMS.Domain.Enums;

namespace HotelPMS.Infrastructure.Data.Converters
{
    public static class BookingStatusConverter
    {
        public static readonly ValueConverter<BookingStatus, string> Converter =
            new ValueConverter<BookingStatus, string>(
                v => v == BookingStatus.CheckedIn ? "Checked-in" :
                     v == BookingStatus.CheckedOut ? "Checked-out" :
                     v == BookingStatus.Pending ? "Pending" :
                     v == BookingStatus.Confirmed ? "Confirmed" :
                     "Cancelled",
                v => v == "Checked-in" ? BookingStatus.CheckedIn :
                     v == "Checked-out" ? BookingStatus.CheckedOut :
                     v == "Pending" ? BookingStatus.Pending :
                     v == "Confirmed" ? BookingStatus.Confirmed :
                     BookingStatus.Cancelled
            );
    }
}