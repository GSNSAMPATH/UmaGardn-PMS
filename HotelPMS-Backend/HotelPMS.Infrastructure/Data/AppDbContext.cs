using HotelPMS.Domain.Entities;
using HotelPMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using HotelPMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using HotelPMS.Infrastructure.Data.Converters;


namespace HotelPMS.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Country> Countries { get; set; }
        public DbSet<Hotel> Hotels { get; set; } = null!;
        public DbSet<Staff> Staffs { get; set; } = null!;
        public DbSet<Guest> Guests { get; set; }
        public DbSet<Room> Rooms { get; set; } = null!;
        public DbSet<RoomType> RoomTypes { get; set; } = null!;
        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<MealPlan> MealPlans { get; set; }
        public DbSet<Addon> Addons { get; set; } = null!;
        public DbSet<ErrorLog> ErrorLogs { get; set; }
        public DbSet<Quotation> Quotations { get; set; }
        public DbSet<QuotationRoom> QuotationRooms { get; set; }

        //reservation   
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingGuest> BookingGuests { get; set; }
        public DbSet<BookingRoom> BookingRooms { get; set; }
        public DbSet<BookingAddon> BookingAddons { get; set; } = null!;
        public DbSet<BookingMealPlan> BookingMealPlans { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; }
        public DbSet<BookingSourceProfile> BookingSourceProfiles { get; set; } 
        public DbSet<Invoice> Invoices { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

   
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(Booking).Assembly);

            modelBuilder.HasPostgresEnum<RoomStatus>(); // tell EF Core about PostgreSQL enum
            modelBuilder.HasPostgresEnum<StaffRole>();
            modelBuilder.HasPostgresEnum<PaymentMethod>();
            modelBuilder.HasPostgresEnum<PaymentStatus>();


            modelBuilder.Entity<Booking>()
                .Property(b => b.Status)
                .HasConversion(BookingStatusConverter.Converter)
                .HasColumnType("booking_status");

                modelBuilder.Entity<Booking>()
                    .Property(b => b.CheckinDate)
                    .HasColumnType("timestamp with time zone");

                modelBuilder.Entity<Booking>()
                    .Property(b => b.CheckoutDate)
                    .HasColumnType("timestamp with time zone");

                modelBuilder.Entity<Booking>()
                    .Property(b => b.ActualCheckIn)
                    .HasColumnType("timestamp with time zone");

                modelBuilder.Entity<Booking>()
                    .Property(b => b.ActualCheckOut)
                    .HasColumnType("timestamp with time zone");

                modelBuilder.Entity<Hotel>(entity =>
                {
                    entity.ToTable("hotels"); // PostgreSQL table name
                    entity.HasKey(e => e.HotelId);
                    entity.Property(e => e.HotelId).HasColumnName("hotel_id");
                    entity.Property(e => e.Name).HasColumnName("name").IsRequired();
                    entity.Property(e => e.Address).HasColumnName("address");
                    entity.Property(e => e.Phone).HasColumnName("phone");
                    entity.Property(e => e.Email).HasColumnName("email");
                });

                modelBuilder.Entity<Staff>(entity =>
                {
                    entity.ToTable("staff");
                    entity.HasKey(e => e.StaffId);

                    entity.Property(e => e.StaffId).HasColumnName("staff_id");
                    entity.Property(e => e.Name).HasColumnName("name").IsRequired();
                    entity.Property(e => e.Email).HasColumnName("email").IsRequired();
                    entity.Property(e => e.PasswordHash).HasColumnName("password_hash").IsRequired();

                    entity.Property(e => e.Role)
                        .HasColumnName("role")
                        .HasColumnType("staff_role"); // ✅ maps directly to Postgres enum

                    entity.Property(e => e.Phone).HasColumnName("phone").IsRequired();

                    entity.Property(s => s.ProfileImageUrl)
                        .HasColumnName("profileimageurl");
                       
                        
                    entity.Property(e => e.CreatedAt)
                        .HasColumnName("created_at")
                        .HasDefaultValueSql("NOW()");
                });


                modelBuilder.Entity<RoomType>(entity =>
                {
                    entity.ToTable("room_types");

                    entity.HasKey(e => e.RoomTypeId);
                    entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");
                    entity.Property(e => e.RoomTypeCode).HasColumnName("room_type_code");
                    entity.Property(e => e.Name).HasColumnName("name").IsRequired();
                    entity.Property(e => e.Description).HasColumnName("description");
                    entity.Property(e => e.BasePrice).HasColumnName("base_price");
                    entity.Property(e => e.MaxAdults).HasColumnName("maxs_adults");
                    entity.Property(e => e.MaxChildren).HasColumnName("max_children");
                    entity.Property(e => e.Size).HasColumnName("size");
                    entity.Property(e => e.BedType).HasColumnName("bed_type");
                    entity.Property(e => e.CreatedAt)
                        .HasColumnName("created_at")
                        .HasDefaultValueSql("NOW()");
                });

                modelBuilder.Entity<Room>(entity =>
                {
                    entity.ToTable("rooms");

                    entity.HasKey(e => e.RoomId);

                    entity.Property(e => e.RoomId)
                        .HasColumnName("room_id");

                    entity.Property(e => e.RoomCode)
                        .HasColumnName("room_code");

                    entity.Property(e => e.RoomNumber)
                        .HasColumnName("room_number")
                        .IsRequired()
                        .HasMaxLength(50);

                    entity.Property(e => e.RoomTypeId)
                        .HasColumnName("room_type_id");

                    entity.Property(e => e.Floor)
                        .HasColumnName("floor");

                    entity.Property(e => e.Status)
                        .HasColumnName("status");

                    entity.Property(e => e.ImageUrl)
                        .HasColumnName("room_image");

                    entity.Property(e => e.CreatedAt)
                        .HasColumnName("created_at")
                        .HasDefaultValueSql("NOW()");

                    // ✅ Configure the foreign key relationship
                    entity.HasOne(e => e.RoomType)
                        .WithMany(rt => rt.Rooms)
                        .HasForeignKey(e => e.RoomTypeId)
                        .OnDelete(DeleteBehavior.Restrict);
                });
                modelBuilder.Entity<Amenity>(entity =>
                {
                    entity.ToTable("amenities");
                    entity.HasKey(a => a.AmenityId);
                    entity.Property(a => a.AmenityId).HasColumnName("amenity_id");
                    entity.Property(a => a.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
                    entity.Property(a => a.Description).HasColumnName("description");
                    entity.Property(a => a.Icon).HasColumnName("icon").HasMaxLength(255);
                });

                modelBuilder.Entity<MealPlan>(entity =>
                {
                    entity.ToTable("meal_plans");

                    entity.HasKey(e => e.MealPlanId);
                    entity.Property(e => e.MealPlanId).HasColumnName("meal_plan_id");

                    entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100);
                    entity.Property(e => e.Description).HasColumnName("description");
                    entity.Property(e => e.Price).HasColumnName("price").HasColumnType("numeric(10, 2)");
                });

                modelBuilder.Entity<Booking>(entity =>
                {
                    entity.ToTable("bookings");

                    entity.HasKey(e => e.BookingId);
                    entity.Property(e => e.BookingId).HasColumnName("booking_id");

                    entity.Property(e => e.BookingRef).HasColumnName("booking_ref");
                    entity.Property(e => e.SourceId).HasColumnName("source_id");

                    entity.Property(e => e.CheckinDate).HasColumnName("checkin_date");
                    entity.Property(e => e.CheckoutDate).HasColumnName("checkout_date");

                    entity.Property(e => e.Adalts).HasColumnName("adults");
                    entity.Property(e => e.Children).HasColumnName("children");

                    entity.Property(e => e.TotalAmount)
                        .HasColumnName("total_amount")
                        .HasColumnType("numeric(10,2)");

                    entity.Property(e => e.Status)
                        .HasColumnName("status")
                        .HasColumnType("booking_status")
                        .HasConversion<string>();

                    entity.Property(e => e.Discount)
                        .HasColumnName("Discount")
                        .HasColumnType("numeric(10,2)");


                    modelBuilder.Entity<Booking>()
        .Property(b => b.CancelledAt)
        .HasColumnName("cancelled_at")
        .HasColumnType("timestamp with time zone");



      
                    entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                    entity.Property(e => e.UpdatedAt).HasColumnName("updated_at"); // ✅ FIX
                });

                    modelBuilder.Entity<BookingGuest>(entity =>
                    {
                        entity.ToTable("booking_guests");

                        entity.HasKey(e => e.BookingGuestId);
                        entity.Property(e => e.BookingGuestId).HasColumnName("guest_id");

                        entity.Property(e => e.Name).HasColumnName("name");
                        entity.Property(e => e.GuestCode).HasColumnName("guest_code");
                        entity.Property(e => e.IdType).HasColumnName("id_type");
                        entity.Property(e => e.IdNumber).HasColumnName("id_number");
                        entity.Property(e => e.Phone).HasColumnName("phone");
                        entity.Property(e => e.Email).HasColumnName("email");
                        entity.Property(e => e.Address).HasColumnName("address");
                        entity.Property(e => e.Country).HasColumnName("country");

                        // ✅ Correct FK mapping
                        entity.Property(e => e.BookingId).HasColumnName("booking_id");

                        entity.HasOne(e => e.Booking)
                            .WithMany(b => b.Guests)
                            .HasForeignKey(e => e.BookingId)
                            .OnDelete(DeleteBehavior.Cascade);
                    });

                modelBuilder.Entity<BookingRoom>(entity =>
                {
                    entity.ToTable("booking_rooms");

                    entity.HasKey(e => e.BookingRoomId);
                    entity.Property(e => e.BookingRoomId).HasColumnName("booking_room_id");

                    entity.Property(e => e.BookingId).HasColumnName("booking_id");
                    entity.Property(e => e.RoomId).HasColumnName("room_id");
                    entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");

                    entity.Property(e => e.PricePerNight)
                        .HasColumnName("price_per_night")
                        .HasColumnType("numeric(10, 2)");

                    entity.Property(e => e.Nights).HasColumnName("nights");

                    entity.HasOne(e => e.Booking)
                        .WithMany(b => b.BookingRooms)
                        .HasForeignKey(e => e.BookingId)
                        .OnDelete(DeleteBehavior.Cascade);
                });

                modelBuilder.Entity<BookingAddon>(entity =>
                {
                    entity.ToTable("booking_addons");
                    entity.HasKey(b => b.BookingAddonId);

                    entity.Property(b => b.BookingAddonId).HasColumnName("booking_addon_id");
                    entity.Property(b => b.BookingId).HasColumnName("booking_id");
                    entity.Property(b => b.AddonId).HasColumnName("addon_id");
                    entity.Property(b => b.Price).HasColumnName("price");

                    entity.HasOne(b => b.Booking)
                        .WithMany(b => b.BookingAddons)
                        .HasForeignKey(b => b.BookingId);

                    entity.HasOne(b => b.Addon)
                        .WithMany()
                        .HasForeignKey(b => b.AddonId);
                });

                modelBuilder.Entity<BookingMealPlan>(entity =>
                {
                    entity.ToTable("booking_meal_plan");
                    entity.HasKey(b => b.BookingMealPlanId);

                    entity.Property(b => b.BookingMealPlanId).HasColumnName("booking_meal_plan_id");
                    entity.Property(b => b.BookingId).HasColumnName("booking_id");
                    entity.Property(b => b.MealPlanId).HasColumnName("meal_plan_id");
                    entity.Property(b => b.Price).HasColumnName("price");

                    entity.HasOne(b => b.Booking)
                        .WithMany(b => b.BookingMealPlans)
                        .HasForeignKey(b => b.BookingId);

                    entity.HasOne(b => b.MealPlan)
                        .WithMany()
                        .HasForeignKey(b => b.MealPlanId);
                });

                modelBuilder.Entity<Payment>(entity =>
                {
                    entity.ToTable("payments");

                    entity.HasKey(e => e.PaymentId);
                    entity.Property(e => e.PaymentId).HasColumnName("payment_id");

                    entity.Property(e => e.BookingId).HasColumnName("booking_id");

                    entity.Property(e => e.Amount)
                        .HasColumnName("amount")
                        .HasColumnType("numeric(10, 2)");

                    modelBuilder.Entity<Payment>(entity =>
                        {
                            entity.Property(e => e.Method)
                                .HasColumnName("method")
                                .HasConversion<string>(); // ✅ ensures enum <-> text
                        });

                    entity.Property(e => e.TransactionId).HasColumnName("transaction_id").HasMaxLength(100);
                    entity.Property(e => e.PaymentDate).HasColumnName("payment_date").HasColumnType("timestamp with time zone");
                    entity.Property(e => e.Status)
                    .HasColumnName("status")
                    .HasConversion<string>();

                    entity.Property(e => e.SubInvoiceNumber).HasColumnName("invoice_number").HasMaxLength(50);

                    entity.HasOne(e => e.Booking)
                        .WithMany(b => b.Payments)
                        .HasForeignKey(e => e.BookingId)
                        .OnDelete(DeleteBehavior.Cascade);
                });

                 modelBuilder.Entity<BookingSourceProfile>(entity =>
                {
                    entity.ToTable("booking_sources");
                    entity.HasKey(e => e.Id);

                    entity.Property(e => e.Id)
                        .HasColumnName("source_id")
                        .IsRequired();

                    entity.Property(e => e.Label)
                        .HasColumnName("label")
                        .HasMaxLength(100)
                        .IsRequired();

                    entity.Property(e => e.SourceType)
                        .HasColumnName("source_type")
                        .HasMaxLength(20)
                        .IsRequired();

                    entity.Property(e => e.WhoPays)
                        .HasColumnName("who_pays")
                        .HasMaxLength(50)
                        .IsRequired();

                    entity.Property(e => e.PaymentTiming)
                        .HasColumnName("payment_timing")
                        .HasMaxLength(50)
                        .IsRequired();

                    entity.Property(e => e.CommissionPercent)
                        .HasColumnName("commission_percent");

                    entity.Property(e => e.IsActive)
                        .HasColumnName("is_active")
                        .HasDefaultValue(true);

                    entity.Property(e => e.CreatedAt)
                        .HasColumnName("created_at")
                        .HasDefaultValueSql("NOW()");
            });


            modelBuilder.Entity<Addon>(entity =>
            {
                entity.ToTable("addons");

                entity.HasKey(a => a.AddonId);

                entity.Property(a => a.AddonId).HasColumnName("addon_id");
                entity.Property(a => a.Name).HasColumnName("name");
                entity.Property(a => a.Price).HasColumnName("price");

                // ✅ Custom converter for enum <-> string
                var chargeTypeConverter = new ValueConverter<AddonChargeType, string>(
                    v => v == AddonChargeType.PerNight ? "per_night" : "per_booking",
                    v => v == "per_night" ? AddonChargeType.PerNight : AddonChargeType.PerBooking
                );

                entity.Property(a => a.ChargeType)
                    .HasColumnName("charge_type")
                    .HasConversion(chargeTypeConverter);

                entity.Property(a => a.IsActive).HasColumnName("is_active");
                entity.Property(a => a.CreatedAt).HasColumnName("created_at");
            });

            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.ToTable("invoices"); // match your PostgreSQL table name

                // Primary key
                entity.HasKey(e => e.InvoiceId);

                // Columns
                entity.Property(e => e.InvoiceId)
                    .HasColumnName("invoice_id");

                entity.Property(e => e.BookingId)
                    .HasColumnName("booking_id");

                entity.Property(e => e.InvoiceNumber)
                    .HasColumnName("invoice_number")
                    .HasMaxLength(100);

                entity.Property(e => e.TotalAmount)
                    .HasColumnName("total_amount")
                    .HasColumnType("numeric(10, 2)");

                entity.Property(e => e.IssuedAt)
                    .HasColumnName("issued_at");

                // Relationships
                entity.HasOne(e => e.Booking)
                    .WithMany(b => b.Invoices)   // ✅ one booking → many invoices
                    .HasForeignKey(e => e.BookingId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
             modelBuilder.Entity<ErrorLog>(entity =>
            {
                entity.ToTable("error_logs"); // ✅ lowercase table name

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("id");

                entity.Property(e => e.Date)
                    .HasColumnName("date");

                entity.Property(e => e.TransactionName)
                    .HasColumnName("transaction_name")
                    .HasMaxLength(100);

                entity.Property(e => e.Message)
                    .HasColumnName("message");

                entity.Property(e => e.StackTrace)
                    .HasColumnName("stack_trace");

                entity.Property(e => e.Data)
                    .HasColumnName("data")
                    .HasColumnType("text");
            });

            modelBuilder.Entity<Quotation>(entity =>
            {
                entity.ToTable("Quotations"); // ✅ lowercase table name

                entity.HasKey(q => q.Id);

                entity.Property(q => q.Id)
                    .HasColumnName("quotation_id");

                entity.Property(q => q.Name)
                    .HasColumnName("name")
                    .HasMaxLength(100);

                entity.Property(q => q.IdType)
                    .HasColumnName("id_type")
                    .HasMaxLength(50);

                entity.Property(q => q.IdNumber)
                    .HasColumnName("id_number")
                    .HasMaxLength(50);

                entity.Property(q => q.Phone)
                    .HasColumnName("phone")
                    .HasMaxLength(20);

                entity.Property(q => q.CheckinDate)
                    .HasColumnName("checkin_date");

                entity.Property(q => q.CheckoutDate)
                    .HasColumnName("checkout_date");

                entity.Property(q => q.MealPlanId)
                    .HasColumnName("meal_plan_id");

                entity.Property(q => q.AddonId)
                    .HasColumnName("addon_id");

                entity.Property(q => q.Adults)
                    .HasColumnName("adults");

                entity.Property(q => q.Children)
                    .HasColumnName("children");

                entity.Property(q => q.TotalAmount)
                    .HasColumnName("total_amount");

                entity.Property(q => q.CreatedAt)
                    .HasColumnName("created_at");
            });

            modelBuilder.Entity<QuotationRoom>(entity =>
            {
                entity.ToTable("QuotationRooms");

                entity.HasKey(qr => qr.Id);

                entity.Property(qr => qr.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();

                entity.Property(qr => qr.QuotationId)
                    .HasColumnName("quotation_id");

                entity.Property(qr => qr.RoomId)
                    .HasColumnName("Room_Id");

                entity.Property(qr => qr.RoomTypeId)
                    .HasColumnName("room_type_id");

                entity.HasOne(qr => qr.Quotation)
                    .WithMany(q => q.QuotationRooms)
                    .HasForeignKey(qr => qr.QuotationId);
            });


        }

    }
}
