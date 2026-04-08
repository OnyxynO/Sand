<?php

use App\Http\Controllers\LoginRapideController;
use App\Models\Export;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// /api/health et /api/config/publique sont déclarés dans routes/bare.php (sans aucun middleware).
// Voir bootstrap/app.php → withRouting(then:) pour l'enregistrement.

// POST /api/login-rapide : crée la session Sanctum pour le role demandé, rate limité 10 req/min par IP
//   → middleware web obligatoire pour les cookies Sanctum (StartSession + VerifyCsrfToken).
Route::middleware('web')->group(function (): void {
    Route::post('/api/login-rapide', [LoginRapideController::class, 'login'])
        ->middleware('throttle:10,1');
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
