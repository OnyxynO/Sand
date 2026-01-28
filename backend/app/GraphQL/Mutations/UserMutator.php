<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserMutator
{
    /**
     * Creer un utilisateur.
     */
    public function create($root, array $args): User
    {
        $this->authorize('create', User::class);

        return User::create([
            'nom' => $args['nom'],
            'prenom' => $args['prenom'],
            'email' => $args['email'],
            'password' => Hash::make($args['password'] ?? 'password'),
            'matricule' => $args['matricule'] ?? null,
            'equipe_id' => $args['equipeId'] ?? null,
            'role' => $args['role'] ?? 'utilisateur',
            'est_actif' => $args['estActif'] ?? true,
        ]);
    }

    /**
     * Mettre a jour un utilisateur.
     */
    public function update($root, array $args): User
    {
        $user = User::findOrFail($args['id']);
        $this->authorize('update', $user);

        $data = array_filter([
            'nom' => $args['nom'] ?? null,
            'prenom' => $args['prenom'] ?? null,
            'email' => $args['email'] ?? null,
            'matricule' => $args['matricule'] ?? null,
            'equipe_id' => $args['equipeId'] ?? null,
            'role' => $args['role'] ?? null,
            'est_actif' => $args['estActif'] ?? null,
        ], fn($v) => $v !== null);

        if (isset($args['password']) && $args['password']) {
            $data['password'] = Hash::make($args['password']);
        }

        $user->update($data);

        return $user->fresh();
    }

    /**
     * Supprimer un utilisateur (soft delete).
     */
    public function delete($root, array $args): bool
    {
        $user = User::findOrFail($args['id']);
        $this->authorize('delete', $user);

        // Empecher la suppression de son propre compte
        if ($user->id === Auth::id()) {
            abort(403, 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        return $user->delete();
    }

    /**
     * Restaurer un utilisateur supprime.
     */
    public function restore($root, array $args): User
    {
        $user = User::withTrashed()->findOrFail($args['id']);
        $this->authorize('restore', $user);

        $user->restore();
        return $user;
    }

    /**
     * Verifier l'autorisation.
     */
    private function authorize(string $ability, $model): void
    {
        $user = Auth::user();
        if (!$user || !$user->can($ability, $model)) {
            abort(403, 'Action non autorisee.');
        }
    }
}
