using HotelPMS.Application.Interfaces;
using HotelPMS.Application.Services;
using HotelPMS.Infrastructure;
using HotelPMS.Infrastructure.Data;
using HotelPMS.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using HotelPMS.Domain.Entities; // ✅ brings in StaffRole, RoomStatus, etc.
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// Add Controllers
builder.Services.AddControllers();

// Add Infrastructure (DB)
builder.Services.AddInfrastructure(builder.Configuration);

// Register Repositories
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
builder.Services.AddScoped<IHotelRepository, HotelRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAmenityRepository, AmenityRepository>();
builder.Services.AddScoped<IMealPlanRepository, MealPlanRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IBookingSourceProfileRepository, BookingSourceProfileRepository>();
builder.Services.AddScoped<IAddonRepository, AddonRepository>();
builder.Services.AddScoped<ICountryRepository, CountryRepository>();
builder.Services.AddScoped<IErrorLogRepository, ErrorLogRepository>();
builder.Services.AddScoped<IQuotationRepository, QuotationRepository>();



builder.Services.AddScoped(sp =>
    new EmailService(
        host: "smtp.gmail.com",      // or smtp.office365.com
        port: 587,
        from: "sumalnadera81@gmail.com",
        username: "sumalnadira123@gmail.com",
        password: "chbr ftqm wlxb svjr" // use app password, not normal login
    )
);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(namingPolicy: null, allowIntegerValues: false)
        );
    });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
            // ✅ Map C# enums to PostgreSQL enums
            npgsqlOptions.MapEnum<StaffRole>();
            npgsqlOptions.MapEnum<RoomStatus>();
        }));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),
            ClockSkew = TimeSpan.Zero
        };
    });

// Authorization
builder.Services.AddAuthorization();

// Swagger (basic, no JWT security)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}


app.UseCors("AllowFrontend");

app.UseRouting();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();