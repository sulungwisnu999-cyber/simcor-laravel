FROM php:8.2-cli

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring xml \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create Laravel in temp dir to avoid "directory not empty" error
RUN COMPOSER_ALLOW_SUPERUSER=1 composer create-project laravel/laravel /tmp/laravel-base --no-interaction \
    && cp -r /tmp/laravel-base/. /var/www/ \
    && rm -rf /tmp/laravel-base

# Copy SIMCOR files over Laravel base
COPY app/ app/
COPY database/ database/
COPY resources/ resources/
COPY routes/ routes/
COPY public/css public/css/
COPY public/js public/js/

RUN cp .env.example .env \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "php artisan config:clear && php artisan key:generate --force && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
