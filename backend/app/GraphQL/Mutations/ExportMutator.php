<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Export;
use App\Services\ExportService;
use Illuminate\Support\Facades\Auth;

class ExportMutator
{
    public function __construct(
        private readonly ExportService $exportService,
    ) {}

    /**
     * Demander un export CSV.
     */
    public function request($root, array $args): array
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        return $this->exportService->toGraphQlPayload(
            $this->exportService->requestExport($user, $args)
        );
    }

    /**
     * Desactiver un export : supprime le fichier, conserve la ligne en base.
     */
    public function desactiver($root, array $args): array
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        return $this->exportService->toGraphQlPayload(
            $this->exportService->disableExport($user, $args['id'])
        );
    }

    /**
     * Supprimer definitivement un export (ligne en base + fichier).
     */
    public function supprimer($root, array $args): bool
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Non authentifie.');
        }

        return $this->exportService->deleteExport($user, $args['id']);
    }
}
