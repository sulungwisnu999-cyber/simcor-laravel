<?php

use App\Http\Controllers\Api\RelayConfigController;
use App\Http\Controllers\Api\StdRulesController;
use App\Http\Controllers\Api\GiDatabaseController;
use App\Http\Controllers\Api\BaFieldsController;
use Illuminate\Support\Facades\Route;

// All SIMCOR API routes require session auth (web middleware applied in bootstrap/app.php or Kernel)
Route::middleware(['web', 'auth'])->prefix('simcor')->group(function () {
    Route::get('/relay-config',  [RelayConfigController::class, 'show']);
    Route::post('/relay-config', [RelayConfigController::class, 'store']);

    Route::get('/std-rules',     [StdRulesController::class, 'show']);
    Route::post('/std-rules',    [StdRulesController::class, 'store']);

    Route::get('/gi-database',   [GiDatabaseController::class, 'show']);
    Route::post('/gi-database',  [GiDatabaseController::class, 'store']);

    Route::get('/ba-fields',     [BaFieldsController::class, 'show']);
    Route::post('/ba-fields',    [BaFieldsController::class, 'store']);
});
