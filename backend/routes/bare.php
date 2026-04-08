<?php

// Routes sans aucun middleware — enregistrées via le callback `then:` de withRouting().
// Ces routes ne passent par aucun groupe web, api ou autre : pas de StartSession, pas de CSRF,
// pas de VerifyCsrfToken. C'est la garantie absolue qu'aucun middleware ne peut interférer,
// même indirectement (contrairement à ->withoutMiddleware('web') qui retire le groupe web
// mais laisse les middlewares globaux s'appliquer).
//
// À utiliser uniquement pour des endpoints qui :
//   - doivent répondre même quand Redis/DB démarrent encore (health checks)
//   - ne nécessitent ni session, ni CSRF, ni authentification

use App\Http\Controllers\LoginRapideController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;

// Health check — utilisé par le frontend pour détecter si les services sont UP.
// Doit répondre JSON pur même si Redis/DB sont lents au démarrage.
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

// Configuration publique pour la connexion rapide (mode démo).
// Setting::get() utilise Cache::tags('settings') — incompatible avec StartSession
// si Redis est lent au démarrage (même vulnérabilité que /api/health).
Route::get('/api/config/publique', [LoginRapideController::class, 'configPublique']);
