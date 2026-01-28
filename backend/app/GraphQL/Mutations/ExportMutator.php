<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ExportMutator
{
    /**
     * Demander un export CSV.
     */
    public function request($root, array $args): array
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        // Verifier les permissions selon le type d'export
        $type = $args['type'];
        if (in_array($type, ['projet', 'equipe', 'global']) && !$user->estModerateur() && !$user->estAdmin()) {
            abort(403, 'Export non autorise.');
        }

        // TODO: Dispatcher un job pour generer l'export
        // Pour l'instant, retourner un job fictif
        $jobId = Str::uuid()->toString();

        return [
            'id' => $jobId,
            'statut' => 'EN_ATTENTE',
            'urlTelechargement' => null,
            'expireLe' => null,
        ];
    }
}
