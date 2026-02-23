<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Absence;
use App\Models\ActivityUserVisibility;
use App\Models\Export;
use App\Models\Notification;
use App\Models\TimeEntry;
use App\Models\TimeEntryLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RgpdService
{
    /**
     * Supprimer toutes les donnees d'un utilisateur (droit a l'oubli).
     * Les logs de saisie sont anonymises (pas supprimes).
     *
     * @return array<string, int> Compteurs des elements traites
     */
    public function supprimerDonneesUtilisateur(User $utilisateur): array
    {
        return DB::transaction(function () use ($utilisateur) {
            $id = $utilisateur->id;

            // Compter avant suppression
            $saisiesSupprimees = TimeEntry::where('user_id', $id)->count();
            $absencesSupprimees = Absence::where('user_id', $id)->count();
            $notificationsSupprimees = Notification::where('user_id', $id)->count();
            $exportsSupprimees = Export::where('user_id', $id)->count();

            // IDs des saisies de l'utilisateur (pour gerer la cascade FK)
            $saisieIds = TimeEntry::where('user_id', $id)->pluck('id');

            // Supprimer les logs lies aux saisies de l'utilisateur (avant cascade FK)
            TimeEntryLog::whereIn('time_entry_id', $saisieIds)->delete();

            // Anonymiser les logs restants ou l'utilisateur est auteur
            // (modifications faites sur les saisies d'autres utilisateurs)
            $logsAnonymises = TimeEntryLog::where('user_id', $id)->count();
            TimeEntryLog::where('user_id', $id)->update(['user_anonymise' => true]);

            // Hard delete des saisies
            TimeEntry::where('user_id', $id)->forceDelete();

            // Supprimer les autres donnees (forceDelete pour absences — droit a l'oubli RGPD)
            Absence::where('user_id', $id)->forceDelete();
            Notification::where('user_id', $id)->delete();
            Export::where('user_id', $id)->delete();
            ActivityUserVisibility::where('user_id', $id)->delete();

            return [
                'saisiesSupprimees' => $saisiesSupprimees,
                'absencesSupprimees' => $absencesSupprimees,
                'notificationsSupprimees' => $notificationsSupprimees,
                'exportsSupprimees' => $exportsSupprimees,
                'logsAnonymises' => $logsAnonymises,
            ];
        });
    }

    /**
     * Purger toutes les donnees transactionnelles de l'application.
     * Conserve : users, teams, projects, activities, settings.
     *
     * @return array<string, int> Compteurs des elements supprimes
     */
    public function purgerToutesDonnees(): array
    {
        return DB::transaction(function () {
            // Compter avant suppression
            $logsSupprimees = TimeEntryLog::count();
            $saisiesSupprimees = TimeEntry::withTrashed()->count();
            $absencesSupprimees = Absence::count();
            $notificationsSupprimees = Notification::count();
            $exportsSupprimees = Export::count();

            // Supprimer dans l'ordre des FK
            TimeEntryLog::query()->delete();
            TimeEntry::withTrashed()->forceDelete();
            Absence::withTrashed()->forceDelete();
            Notification::query()->delete();
            Export::query()->delete();
            ActivityUserVisibility::query()->delete();

            return [
                'saisiesSupprimees' => $saisiesSupprimees,
                'logsSupprimees' => $logsSupprimees,
                'absencesSupprimees' => $absencesSupprimees,
                'notificationsSupprimees' => $notificationsSupprimees,
                'exportsSupprimees' => $exportsSupprimees,
            ];
        });
    }
}
