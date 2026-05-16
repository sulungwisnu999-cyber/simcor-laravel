#!/bin/sh
set -e

# Get APP_KEY baked during build as fallback
BUILT_KEY=$(grep '^APP_KEY=' /var/www/.env 2>/dev/null | cut -d'=' -f2- | tr -d '"' || echo '')
FINAL_KEY="${APP_KEY:-$BUILT_KEY}"

# Write fresh .env from environment variables
{
  echo "APP_NAME=SIMCOR"
  echo "APP_ENV=${APP_ENV:-production}"
  echo "APP_KEY=${FINAL_KEY}"
  echo "APP_DEBUG=${APP_DEBUG:-false}"
  echo "APP_URL=${APP_URL:-http://localhost}"
  echo "ASSET_URL=${ASSET_URL:-${APP_URL:-}}"
  echo "LOG_CHANNEL=stderr"
  echo "DB_CONNECTION=${DB_CONNECTION:-mysql}"
  echo "DB_HOST=${DB_HOST}"
  echo "DB_PORT=${DB_PORT:-3306}"
  echo "DB_DATABASE=${DB_DATABASE:-railway}"
  echo "DB_USERNAME=${DB_USERNAME:-root}"
  printf 'DB_PASSWORD=%s\n' "${DB_PASSWORD}"
  echo "CACHE_STORE=file"
  echo "SESSION_DRIVER=file"
  echo "SESSION_LIFETIME=120"
} > /var/www/.env

php artisan config:clear
php artisan migrate --force
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
