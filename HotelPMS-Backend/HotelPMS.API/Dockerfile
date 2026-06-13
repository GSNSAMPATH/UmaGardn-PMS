# HotelPMS.API/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY ["HotelPMS.API/HotelPMS.API.csproj", "HotelPMS.API/"]
# if using solution-level restore, copy the .sln and others too
COPY ["HotelPMS.Application/HotelPMS.Application.csproj", "HotelPMS.Application/"]
COPY ["HotelPMS.Infrastructure/HotelPMS.Infrastructure.csproj", "HotelPMS.Infrastructure/"]
COPY ["HotelPMS.Domain/HotelPMS.Domain.csproj", "HotelPMS.Domain/"]
RUN dotnet restore "HotelPMS.API/HotelPMS.API.csproj"

# copy everything and build
COPY . .
WORKDIR "/src/HotelPMS.API"
RUN dotnet publish "HotelPMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
# copy a small wait script that we'll use to ensure db is ready (optional)


# When container starts, run migrations then start the app
ENTRYPOINT ["dotnet", "HotelPMS.API.dll"]
