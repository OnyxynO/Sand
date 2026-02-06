<?php

use App\Models\Export;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

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

// Telechargement d'export (authentification Sanctum via cookie)
Route::get('/exports/{id}/download', function (string $id) {
    $user = auth('sanctum')->user();
    if (!$user) {
        abort(401, 'Non authentifie.');
    }

    $export = Export::findOrFail($id);

    // Seul le proprietaire peut telecharger
    if ($export->user_id !== $user->id) {
        abort(403, 'Acces interdit.');
    }

    if (!$export->estTermine()) {
        abort(404, 'Export non disponible.');
    }

    if ($export->estExpire()) {
        abort(410, 'Export expire.');
    }

    if (!Storage::disk('local')->exists($export->chemin_fichier)) {
        abort(404, 'Fichier introuvable.');
    }

    return Storage::disk('local')->download(
        $export->chemin_fichier,
        $export->nom_fichier,
        ['Content-Type' => 'text/csv; charset=utf-8'],
    );
})->middleware('web');
