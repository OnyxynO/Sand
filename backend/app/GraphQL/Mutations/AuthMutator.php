<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use GraphQL\Error\Error;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthMutator
{
    /**
     * Connexion d'un utilisateur
     */
    public function login($root, array $args): array
    {
        // Trim email et password pour eviter les erreurs de copier-coller
        $email = trim($args['email']);
        $password = trim($args['password']);

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new Error('Identifiants invalides.');
        }

        if (!$user->est_actif) {
            throw new Error('Ce compte a ete desactive.');
        }

        // Connexion session Sanctum (cookie HttpOnly)
        // Auth::login() utilise le guard par défaut, mais Lighthouse le change en 'sanctum' (RequestGuard
        // stateless, sans méthode login). On cible explicitement 'web' (SessionGuard, stateful).
        Auth::guard('web')->login($user);

        return [
            'user' => $user,
        ];
    }

    /**
     * Deconnexion de l'utilisateur
     */
    public function logout(): bool
    {
        // Déconnexion de la session web (guard 'web' = SessionGuard, stateful).
        // Même raison que pour login : Lighthouse change le guard par défaut en 'sanctum'.
        Auth::guard('web')->logout();

        // Invalider la session pour que l'ancien cookie laravel_session soit inutilisable.
        // Sans ça, un refresh de page après logout reconnecte l'utilisateur.
        // hasSession() protège le contexte de test (actingAs sanctum, sans session HTTP).
        $request = request();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return true;
    }
}
