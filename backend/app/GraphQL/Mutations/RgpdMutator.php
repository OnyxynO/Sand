<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Services\RgpdService;
use Illuminate\Support\Facades\Auth;

class RgpdMutator
{
    public function __construct(
        private readonly RgpdService $rgpdService,
    ) {}

    /**
     * Supprimer les donnees d'un utilisateur (droit a l'oubli RGPD).
     */
    public function supprimerDonneesUtilisateur($root, array $args): array
    {
        $this->autoriser();

        $utilisateur = User::findOrFail($args['userId']);

        // Verification du nom complet pour confirmation
        $nomComplet = $utilisateur->prenom . ' ' . $utilisateur->nom;
        if ($args['confirmationNom'] !== $nomComplet) {
            abort(403, 'Le nom de confirmation ne correspond pas.');
        }

        return $this->rgpdService->supprimerDonneesUtilisateur($utilisateur);
    }

    /**
     * Purger toutes les donnees transactionnelles.
     */
    public function purgerToutesDonnees($root, array $args): array
    {
        $this->autoriser();

        if ($args['confirmationPhrase'] !== 'CONFIRMER SUPPRESSION') {
            abort(403, 'La phrase de confirmation est incorrecte.');
        }

        return $this->rgpdService->purgerToutesDonnees();
    }

    /**
     * Verifier l'autorisation (admin uniquement).
     */
    private function autoriser(): void
    {
        $user = Auth::user();
        if (!$user || !$user->estAdmin()) {
            abort(403, 'Seuls les administrateurs peuvent effectuer des operations RGPD.');
        }
    }
}
