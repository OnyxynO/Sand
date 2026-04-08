<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Connexion rapide par rôle — mode démo uniquement.
 *
 * AVERTISSEMENT SÉCURITÉ : ces endpoints sont publics par définition.
 * Tout visiteur ayant l'URL peut se connecter avec n'importe quel rôle configuré.
 * Ne jamais activer sur une instance avec de vraies données.
 *
 * Points de contrôle :
 * - Variable d'env CONNEXION_RAPIDE_DISABLED=true pour désactivation d'urgence (hors BDD)
 * - Setting connexion_rapide_activee doit être truthy
 * - Rate limiting : 10 req/min par IP sur POST /api/login-rapide
 */
class LoginRapideController extends Controller
{
    /**
     * GET /api/config/publique
     *
     * Retourne la configuration visible par la page login sans authentification.
     * Jamais d'IDs utilisateurs dans la réponse — uniquement les rôles disponibles.
     */
    public function configPublique(): JsonResponse
    {
        // Désactivation d'urgence indépendante de la BDD
        if (config('app.connexion_rapide_disabled')) {
            return response()->json([
                'connexion_rapide' => ['activee' => false, 'roles' => []],
            ]);
        }

        // Setting::get() utilise Cache::tags('settings') → Redis requis.
        // Si Redis est lent au démarrage, on retourne le mode désactivé (dégradé propre).
        try {
            $activee = (bool) Setting::get(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 0);
        } catch (\Throwable) {
            return response()->json([
                'connexion_rapide' => ['activee' => false, 'roles' => []],
            ]);
        }

        if (! $activee) {
            return response()->json([
                'connexion_rapide' => ['activee' => false, 'roles' => []],
            ]);
        }

        $roles = Setting::get(Setting::CLE_CONNEXION_RAPIDE_ROLES, []);

        // N'exposer que les rôles qui ont un user_id configuré (non nul)
        $rolesDisponibles = array_keys(array_filter(
            is_array($roles) ? $roles : [],
            fn ($userId) => $userId !== null && $userId !== '',
        ));

        return response()->json([
            'connexion_rapide' => [
                'activee' => true,
                'roles'   => $rolesDisponibles,
            ],
        ]);
    }

    /**
     * POST /api/login-rapide
     *
     * Crée une session Sanctum pour le user associé au rôle demandé.
     * Rate limited : 10 req/min par IP.
     */
    public function login(Request $request): JsonResponse
    {
        // Désactivation d'urgence indépendante de la BDD
        if (config('app.connexion_rapide_disabled')) {
            return response()->json(['message' => 'Fonctionnalité désactivée.'], 403);
        }

        $activee = (bool) Setting::get(Setting::CLE_CONNEXION_RAPIDE_ACTIVEE, 0);
        if (! $activee) {
            return response()->json(['message' => 'La connexion rapide est désactivée.'], 403);
        }

        $role = $request->input('role');
        $rolesValides = ['admin', 'moderateur', 'utilisateur'];

        if (! in_array($role, $rolesValides, strict: true)) {
            return response()->json(['message' => 'Rôle invalide.'], 422);
        }

        $roles = Setting::get(Setting::CLE_CONNEXION_RAPIDE_ROLES, []);
        $userId = is_array($roles) ? ($roles[$role] ?? null) : null;

        if ($userId === null || $userId === '') {
            return response()->json(['message' => 'Aucun utilisateur configuré pour ce rôle.'], 422);
        }

        $user = User::find($userId);
        if ($user === null) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 422);
        }

        if (! $user->est_actif) {
            return response()->json(['message' => 'Ce compte est désactivé.'], 422);
        }

        // Même mécanisme que le login GraphQL — guard 'web' pour la session stateful Sanctum
        Auth::guard('web')->login($user);

        return response()->json([
            'user' => [
                'id'     => $user->id,
                'email'  => $user->email,
                'nom'    => $user->nom,
                'prenom' => $user->prenom,
                'role'   => $user->role,
            ],
        ]);
    }
}
