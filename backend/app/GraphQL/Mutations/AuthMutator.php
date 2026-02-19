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

        // Connexion session (pour SPA)
        Auth::login($user);

        // Generer un token API (pour tests CLI / mobile)
        $token = $user->createToken('api')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Deconnexion de l'utilisateur
     */
    public function logout(): bool
    {
        $user = Auth::user();

        if ($user) {
            // Revoquer le token courant si auth via token Sanctum
            $token = $user->currentAccessToken();
            if ($token && method_exists($token, 'delete')) {
                $token->delete();
            }
        }

        // Note: Auth::logout() ne fonctionne pas avec le guard sanctum (stateless)
        // La revocation du token suffit

        return true;
    }
}
