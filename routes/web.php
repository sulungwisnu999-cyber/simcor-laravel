<?php

use App\Http\Controllers\SimcorController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => redirect('/simcor'));

// Auth routes (requires Laravel Breeze or manual implementation)
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::get('/simcor', [SimcorController::class, 'index'])->name('simcor');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
