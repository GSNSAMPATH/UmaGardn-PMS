using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HotelPMS.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Add DbContext
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
            });

            // Add Repositories Here
            // services.AddScoped<IRoomRepository, RoomRepository>();
            // services.AddScoped<IBookingRepository, BookingRepository>();
            // services.AddScoped<IUserRepository, UserRepository>();

            return services;
        }
    }
}
