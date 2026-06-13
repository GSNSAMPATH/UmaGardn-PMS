#!/usr/bin/env bash
# docker/wait-for-postgres.sh
set -e

host="${POSTGRES_HOST:-db}"
port="${POSTGRES_PORT:-5432}"
user="${POSTGRES_USER:-postgres}"
db="${POSTGRES_DB:-hotelpms}"

echo "Waiting for postgres at $host:$port..."

until PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "$host" -U "$user" -p "$port" -d "$db" -c '\q' 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Run EF migrations before starting the app (optional)
if [ -f "/app/HotelPMS.API.dll" ]; then
  echo "Applying database migrations..."
  dotnet ef database update --no-build --project /src/HotelPMS.Infrastructure/HotelPMS.Infrastructure.csproj --startup-project /src/HotelPMS.API/HotelPMS.API.csproj || true
fi

# Exec the original command (e.g. dotnet HotelPMS.API.dll)
exec "$@"
