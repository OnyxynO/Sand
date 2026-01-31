<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

Route::get('/', function () {
    return view('welcome');
});

// Health check endpoint
Route::get('/api/health', function () {
    $health = [
        'status' => 'ok',
        'service' => 'sand-backend',
        'checks' => [],
    ];

    // Verification base de donnees
    try {
        DB::connection()->getPdo();
        $health['checks']['database'] = 'ok';
    } catch (\Exception $e) {
        $health['status'] = 'degraded';
        $health['checks']['database'] = 'error';
    }

    // Verification Redis
    try {
        Redis::ping();
        $health['checks']['redis'] = 'ok';
    } catch (\Exception $e) {
        $health['status'] = 'degraded';
        $health['checks']['redis'] = 'error';
    }

    $httpStatus = $health['status'] === 'ok' ? 200 : 503;
    return response()->json($health, $httpStatus);
});
