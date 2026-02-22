<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Exceptions\RhApiException;
use App\Models\Absence;
use App\Models\Notification;
use App\Models\Setting;
use App\Models\TimeEntry;
use App\Models\User;
use App\Services\RhApiClient;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AbsenceMutator
{
    protected RhApiClient $rhApiClient;

    public function __construct(RhApiClient $rhApiClient)
    {
        $this->rhApiClient = $rhApiClient;
    }

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

        // Determiner les utilisateurs a synchroniser
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

        // Verifier la disponibilite de l'API RH
        if (! $this->rhApiClient->healthCheck()) {
            return [
                'importes' => 0,
                'conflits' => 0,
                'erreurs' => ["L'API RH est actuellement indisponible"],
            ];
        }

        foreach ($utilisateurs as $utilisateur) {
            try {
                $resultat = $this->syncUtilisateur($utilisateur, $dateDebut, $dateFin);
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
     * Synchroniser les absences d'un utilisateur specifique.
     */
    protected function syncUtilisateur(User $utilisateur, string $dateDebut, string $dateFin): array
    {
        $absencesRh = $this->rhApiClient->getAbsences(
            $utilisateur->matricule,
            $dateDebut,
            $dateFin
        );

        $importes = 0;
        $conflits = 0;

        foreach ($absencesRh as $absenceRh) {
            $resultat = $this->traiterAbsence($utilisateur, $absenceRh);
            if ($resultat['importe']) {
                $importes++;
            }
            if ($resultat['conflit']) {
                $conflits++;
            }
        }

        return [
            'importes' => $importes,
            'conflits' => $conflits,
        ];
    }

    /**
     * Traiter une absence provenant de l'API RH.
     */
    protected function traiterAbsence(User $utilisateur, array $absenceRh): array
    {
        $referenceExterne = (string) $absenceRh['id'];
        $importe = false;
        $conflit = false;

        return DB::transaction(function () use ($utilisateur, $absenceRh, $referenceExterne, &$importe, &$conflit) {
            // Verifier si l'absence existe deja
            $absenceExistante = Absence::where('reference_externe', $referenceExterne)->first();

            if ($absenceExistante) {
                // Mise a jour du statut si necessaire
                $this->mettreAJourStatut($absenceExistante, $absenceRh);

                return ['importe' => false, 'conflit' => false];
            }

            // Creer la nouvelle absence
            $absence = Absence::create([
                'user_id' => $utilisateur->id,
                'type' => $this->mapperType($absenceRh['type']),
                'date_debut' => $absenceRh['date_debut'],
                'date_fin' => $absenceRh['date_fin'],
                'duree_journaliere' => $absenceRh['duree_journaliere'] ?? 1.0,
                'statut' => $this->mapperStatut($absenceRh['statut']),
                'reference_externe' => $referenceExterne,
                'importe_le' => now(),
            ]);

            $importe = true;

            // Detecter les conflits avec les saisies existantes
            $saisiesEnConflit = $this->detecterConflits($utilisateur, $absence);

            if ($saisiesEnConflit->isNotEmpty()) {
                $conflit = true;
                $this->creerNotificationConflit($utilisateur, $absence, $saisiesEnConflit);
            } else {
                $this->creerNotificationImport($utilisateur, $absence);
            }

            return ['importe' => $importe, 'conflit' => $conflit];
        });
    }

    /**
     * Mettre a jour le statut d'une absence existante.
     */
    protected function mettreAJourStatut(Absence $absence, array $absenceRh): void
    {
        $nouveauStatut = $this->mapperStatut($absenceRh['statut']);

        if ($absence->statut !== $nouveauStatut) {
            $absence->update([
                'statut' => $nouveauStatut,
                'importe_le' => now(),
            ]);
        }
    }

    /**
     * Detecter les saisies en conflit avec une absence.
     */
    protected function detecterConflits(User $utilisateur, Absence $absence)
    {
        return TimeEntry::where('user_id', $utilisateur->id)
            ->whereBetween('date', [$absence->date_debut, $absence->date_fin])
            ->get();
    }

    /**
     * Creer une notification de conflit.
     */
    protected function creerNotificationConflit(User $utilisateur, Absence $absence, $saisies): void
    {
        $nombreSaisies = $saisies->count();
        $message = "L'absence {$absence->type_libelle} du {$absence->date_debut->format('d/m/Y')} "
            ."au {$absence->date_fin->format('d/m/Y')} est en conflit avec "
            ."{$nombreSaisies} saisie(s) existante(s).";

        Notification::creer(
            $utilisateur,
            Notification::TYPE_CONFLIT_ABSENCE,
            'Conflit absence/saisie detecte',
            $message,
            [
                'absence_id' => $absence->id,
                'saisie_ids' => $saisies->pluck('id')->toArray(),
            ]
        );
    }

    /**
     * Creer une notification d'import reussi.
     */
    protected function creerNotificationImport(User $utilisateur, Absence $absence): void
    {
        $message = "Absence {$absence->type_libelle} importee "
            ."du {$absence->date_debut->format('d/m/Y')} "
            ."au {$absence->date_fin->format('d/m/Y')}.";

        Notification::creer(
            $utilisateur,
            Notification::TYPE_ABSENCE_IMPORTEE,
            'Absence importee du systeme RH',
            $message,
            [
                'absence_id' => $absence->id,
            ]
        );
    }

    /**
     * Mapper le type d'absence RH vers le type SAND.
     */
    protected function mapperType(string $typeRh): string
    {
        return match ($typeRh) {
            'conges_payes', 'conges' => Absence::TYPE_CONGES_PAYES,
            'rtt' => Absence::TYPE_RTT,
            'maladie' => Absence::TYPE_MALADIE,
            'formation' => Absence::TYPE_FORMATION,
            default => Absence::TYPE_AUTRE,
        };
    }

    /**
     * Mapper le statut RH vers le statut SAND.
     */
    protected function mapperStatut(string $statutRh): string
    {
        return match ($statutRh) {
            'valide', 'validee', 'approuve' => Absence::STATUT_VALIDE,
            'annule', 'annulee', 'refuse' => Absence::STATUT_ANNULE,
            default => Absence::STATUT_VALIDE,
        };
    }

    /**
     * Creer manuellement une absence (admin/moderateur).
     */
    public function create($root, array $args): Absence
    {
        $this->authorize('create', Absence::class);

        return DB::transaction(function () use ($args) {
            $absence = Absence::create([
                'user_id' => $args['user_id'],
                'date_debut' => $args['date_debut'],
                'date_fin' => $args['date_fin'],
                'type' => $args['type'],
                'duree_journaliere' => $args['duree_journaliere'] ?? 1.0,
                'statut' => Absence::STATUT_VALIDE,
            ]);

            return $absence;
        });
    }

    /**
     * Resoudre un conflit entre absence et saisies existantes.
     *
     * @param  array  $args  Contient absenceId et resolution (ECRASER|IGNORER)
     */
    public function resolveConflict($root, array $args): bool
    {
        $this->authorize('resolveConflict', Absence::class);

        $absenceId = $args['absenceId'];
        $resolution = $args['resolution']; // 'ECRASER' ou 'IGNORER'

        return DB::transaction(function () use ($absenceId, $resolution) {
            $absence = Absence::findOrFail($absenceId);

            if ($resolution === 'IGNORER') {
                // Ignorer l'absence = l'annuler, garder les saisies
                $absence->update(['statut' => Absence::STATUT_ANNULE]);
            } elseif ($resolution === 'ECRASER') {
                // Ecraser = supprimer TOUTES les saisies en conflit avec cette absence
                TimeEntry::where('user_id', $absence->user_id)
                    ->whereBetween('date', [$absence->date_debut, $absence->date_fin])
                    ->delete();
            }

            // Marquer les notifications de conflit associees comme lues
            Notification::where('user_id', $absence->user_id)
                ->where('type', Notification::TYPE_CONFLIT_ABSENCE)
                ->where('est_lu', false)
                ->whereJsonContains('donnees->absence_id', $absence->id)
                ->update(['est_lu' => true, 'lu_le' => now()]);

            return true;
        });
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

        $user = Auth::user();
        $date = Carbon::parse($args['date'])->format('Y-m-d');
        $duree = $args['duree'] ?? null;

        $existante = Absence::where('user_id', $user->id)
            ->where('date_debut', $date)
            ->where('date_fin', $date)
            ->whereNull('reference_externe')
            ->first();

        if ($duree === null || $duree <= 0) {
            $existante?->delete();
        } else {
            if ($existante) {
                $existante->update(['duree_journaliere' => $duree]);
            } else {
                Absence::create([
                    'user_id' => $user->id,
                    'date_debut' => $date,
                    'date_fin' => $date,
                    'type' => Absence::TYPE_AUTRE,
                    'duree_journaliere' => $duree,
                    'statut' => Absence::STATUT_VALIDE,
                ]);
            }

            $dateFormatee = Carbon::parse($date)->format('d/m/Y');
            $dureeLibelle = $duree >= 1.0 ? 'journee complete' : 'demi-journee';
            Notification::creer(
                $user,
                Notification::TYPE_ABSENCE_IMPORTEE,
                'Absence declaree',
                "Absence du {$dateFormatee} ({$dureeLibelle}) enregistree."
            );
        }

        return true;
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
