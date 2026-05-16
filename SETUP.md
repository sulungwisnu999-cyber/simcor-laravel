# SIMCOR v8 — Laravel Setup Guide

## Prerequisites
- PHP 8.2+
- Composer
- MySQL 8.0+ (or any Laravel-supported DB)
- Node.js (optional, for Vite)

## Installation Steps

### 1. Create a new Laravel project and merge this scaffold

```bash
composer create-project laravel/laravel simcor-app
cd simcor-app
```

Copy all files from this scaffold into the Laravel project root, merging/overwriting:
- `app/Http/Controllers/` → override/add
- `app/Models/` → override/add
- `database/migrations/` → add
- `routes/web.php` and `routes/api.php` → override
- `resources/views/` → override/add
- `public/css/simcor.css` → add
- `public/js/simcor.js` → add

### 2. Configure `.env`

```env
APP_NAME=SIMCOR
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=simcor
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Run migrations

```bash
php artisan migrate
```

### 4. Configure API routes (Laravel 11+)

In `bootstrap/app.php`, ensure the API routes use the `web` middleware (so sessions work):

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api',
    // Add this to apply web middleware to API routes for session auth:
)
```

Or in `routes/api.php` the `['web', 'auth']` middleware group handles it.

For **Laravel 10**, in `app/Http/Kernel.php` the `api` middleware group defaults to Sanctum.
Change the API routes to use `web` + `auth` middleware as written in `routes/api.php`.

### 5. (Laravel 10) Register API routes in `RouteServiceProvider`

If using Laravel 10, ensure `routes/api.php` is loaded in `RouteServiceProvider.php`:
```php
Route::middleware('web')
    ->prefix('api')
    ->group(base_path('routes/api.php'));
```

### 6. Start the development server

```bash
php artisan serve
```

Open `http://localhost:8000` → Register → Login → SIMCOR app loads.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Browser                                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  simcor/app.blade.php                            │   │
│  │  ├─ window.__SIMCOR_DATA (PHP → JS bridge)      │   │
│  │  ├─ public/css/simcor.css                        │   │
│  │  └─ public/js/simcor.js (all calculations)       │   │
│  └─────────────────────────────────────────────────┘   │
│         │ fetch POST (JSON + CSRF)                       │
│         ▼                                                │
│  Laravel API (/api/simcor/*)                            │
│  ├─ relay-config   → relay_configs table (JSON)         │
│  ├─ std-rules      → std_rules table (JSON)             │
│  ├─ gi-database    → gi_databases table (JSON)          │
│  └─ ba-fields      → ba_fields table (JSON)             │
└─────────────────────────────────────────────────────────┘
```

## Data Persistence

| Data | Storage | Trigger |
|------|---------|---------|
| Relay Config (10 relays + sys settings + fault rows) | `relay_configs` DB table | Auto-save 3s after any change |
| Standard Rules | `std_rules` DB table | On every rule edit |
| GI Database | `gi_databases` DB table | On any add/edit/delete |
| Berita Acara fields | `ba_fields` DB table | On every field input |

All data is per-user (multi-tenant by `user_id`).

## Key JS Changes from v8 HTML

| Original | Laravel version |
|----------|----------------|
| `localStorage.setItem('simcor_stdrules_v10', ...)` | `fetch('/api/simcor/std-rules', {...})` |
| `localStorage.getItem('simcor_stdrules_v10')` | `window.__SIMCOR_DATA.stdRules` |
| `localStorage.setItem('simcor_gidb_v12', ...)` | `fetch('/api/simcor/gi-database', {...})` |
| `localStorage.getItem('simcor_gidb_v12')` | `window.__SIMCOR_DATA.giDatabase` |
| `localStorage.setItem('simcor_ba_v8', ...)` | `fetch('/api/simcor/ba-fields', {...})` |
| `localStorage.getItem('simcor_ba_v8')` | `window.__SIMCOR_DATA.baFields` |
| Relay config: in-memory only (lost on refresh) | Auto-saved to `relay_configs` table |
