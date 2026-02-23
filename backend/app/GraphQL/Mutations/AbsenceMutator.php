<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Exceptions\RhApiException;
use App\Models\Absence;
use App\Models\Setting;
use App\Models\User;
use App\Services\AbsenceService;
use App\Services\RhApiClient;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AbsenceMutator
{
    public function __construct(
        protected AbsenceService $absenceService,
        protected RhApiClient $rhApiClient,
    ) {}

    /**
     * Synchroniser les absences depuis l'API RH externe.
     */
    public function sync($root, array $args): array
    {
        $this->authorize('sync', Absence::class);

        $userId = $args['userId'] ?? null;
        $dateDebut = Carbon::parse($args['dateDebut'])->format('Y-m-d');
        $dateFin = Carbon::parse($args['dateFin'])->format('Y-m-d');

        $importes = 0;
        $conflits = 0;
        $erreurs = [];

        if ($userId) {
            $utilisateurs = User::where('id', $userId)->whereNotNull('matricule')->get();
        } else {
            $utilisateurs = User::actif()->whereNotNull('matricule')->where('matricule', '!=', '')->get();
        }

        if ($utilisateurs->isEmpty()) {
            return [
                'importes' => 0,
                'conflits' => 0,
                'erreurs' => ['Aucun utilisateur avec matricule trouve'],
            ];
        }

        if (! $this->rhApiClient->healthCheck()) {
            return [
                'importes' => 0,
                'conflits' => 0,
                'erreurs' => ["L'API RH est actuellement indisponible"],
            ];
        }

        foreach ($utilisateurs as $utilisateur) {
            try {
                $resultat = $this->absenceService->syncUtilisateur($utilisateur, $dateDebut, $dateFin);
                $importes += $resultat['importes'];
                $conflits += $resultat['conflits'];
            } catch (RhApiException $e) {
                $erreurs[] = "Erreur pour {$utilisateur->matricule} : {$e->getMessage()}";
                Log::error('Erreur sync absence', [
                    'utilisateur' => $utilisateur->id,
                    'matricule' => $utilisateur->matricule,
                    'erreur' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Sync absences terminee', [
            'importes' => $importes,
            'conflits' => $conflits,
            'erreurs' => count($erreurs),
        ]);

        return [
            'importes' => $importes,
            'conflits' => $conflits,
            'erreurs' => $erreurs,
        ];
    }

    /**
     * Creer manuellement une absence (admin/moderateur).
     */
    public function create($root, array $args): Absence
    {
        $this->authorize('create', Absence::class);

        return $this->absenceService->creerAbsence($args);
    }

    /**
     * Resoudre un conflit entre absence et saisies existantes.
     */
    public function resolveConflict($root, array $args): bool
    {
        $this->authorize('resolveConflict', Absence::class);

        return $this->absenceService->resoudreConflit((int) $args['absenceId'], $args['resolution']);
    }

    /**
     * Declarer manuellement sa propre absence pour une journee.
     * Uniquement disponible en mode 'manuel'. duree null = supprimer l'absence.
     */
    public function declarerAbsence($root, array $args): bool
    {
        $mode = Setting::get(Setting::CLE_ABSENCE_MODE, 'manuel');
        if ($mode !== 'manuel') {
            abort(403, 'La declaration manuelle est desactivee en mode API.');
        }

        $connecte = Auth::user();

        if (!empty($args['userId']) && $args['userId'] != $connecte->id) {
            if (!$connecte->estModerateur()) {
                abort(403, 'Vous ne pouvez declarer que vos propres absences.');
            }
            $user = User::findOrFail($args['userId']);
        } else {
            $user = $connecte;
        }

        $date = Carbon::parse($args['date'])->format('Y-m-d');
        $duree = $args['duree'] ?? null;

        return $this->absenceService->declarerAbsenceManuellement($user, $date, $duree);
    }

    /**
     * Tester la connexion a l'API RH avec les settings actuels.
     * Retourne null si OK, ou un message d'erreur si KO.
     */
    public function testerConnexionRhApi($root, array $args): ?string
    {
        $this->authorize('sync', Absence::class);

        $url = Setting::get(Setting::CLE_ABSENCE_API_URL, '');
        $token = Setting::get(Setting::CLE_ABSENCE_API_TOKEN, '');

        if (empty($url)) {
            return "L'URL de l'API RH n'est pas configuree.";
        }

        $client = RhApiClient::avecConfig($url, $token);
        $ok = $client->healthCheck();

        return $ok ? null : "Connexion a l'API RH impossible. Verifiez l'URL et le token.";
    }

    /**
     * Verifier l'autorisation.
     */
    private function authorize(string $ability, $model): void
    {
        $user = Auth::user();
        if (! $user || ! $user->can($ability, $model)) {
            abort(403, 'Action non autorisee.');
        }
    }
}
