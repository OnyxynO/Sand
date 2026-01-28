<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthMutator
{
    /**
     * Connexion d'un utilisateur
     */
    public function login($root, array $args): array
    {
        $user = User::where('email', $args['email'])->first();

        if (!$user || !Hash::check($args['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        if (!$user->est_actif) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte a ete desactive.'],
            ]);
        }

        Auth::login($user);

        return ['user' => $user];
    }

    /**
     * Deconnexion de l'utilisateur
     */
    public function logout(): bool
    {
        Auth::logout();

        return true;
    }
}
