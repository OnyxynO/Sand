<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\Activity;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\TimeEntryLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeder de donnees de demonstration realistes.
 * Usage : php artisan db:seed --class=DemoSeeder
 * Reset complet + creation de donnees pour janvier 2026.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Nettoyage des tables...');
        $this->truncateTables();

        $this->command->info('Creation des donnees de base (equipes, utilisateurs, settings)...');
        $this->call([
            TeamSeeder::class,
            UserSeeder::class,
            SettingSeeder::class,
        ]);

        $this->command->info('Creation de l\'arborescence des activites...');
        $this->creerActivites();

        $this->command->info('Creation des projets et affectations...');
        $this->creerProjets();

        $this->command->info('Creation des saisies de janvier 2026...');
        $this->creerSaisies();

        $this->command->info('Creation des absences...');
        $this->creerAbsences();

        $this->command->info('DemoSeeder termine !');
    }

    /**
     * Vide toutes les tables dans le bon ordre (foreign keys).
     */
    private function truncateTables(): void
    {
        DB::statement('SET session_replication_role = replica;');

        DB::table('time_entry_logs')->truncate();
        DB::table('time_entries')->truncate();
        DB::table('absences')->truncate();
        DB::table('activity_user_visibilities')->truncate();
        DB::table('project_activities')->truncate();
        DB::table('project_user')->truncate();
        DB::table('project_moderators')->truncate();
        DB::table('notifications')->truncate();
        DB::table('exports')->truncate();
        DB::table('projects')->truncate();
        DB::table('activities')->truncate();
        DB::table('users')->truncate();
        DB::table('teams')->truncate();
        DB::table('settings')->truncate();

        DB::statement('SET session_replication_role = DEFAULT;');

        // Reset les sequences
        DB::statement("SELECT setval('activities_id_seq', 1, false)");
        DB::statement("SELECT setval('projects_id_seq', 1, false)");
        DB::statement("SELECT setval('users_id_seq', 1, false)");
        DB::statement("SELECT setval('teams_id_seq', 1, false)");
        DB::statement("SELECT setval('time_entries_id_seq', 1, false)");
        DB::statement("SELECT setval('time_entry_logs_id_seq', 1, false)");
        DB::statement("SELECT setval('absences_id_seq', 1, false)");
    }

    /**
     * Arborescence detaillee (~25 activites, 3 niveaux).
     */
    private function creerActivites(): void
    {
        // Absence (systeme, feuille)
        $this->creerActivite([
            'nom' => 'Absence',
            'code' => 'ABS',
            'description' => 'Activite systeme pour les absences',
            'parent_id' => null,
            'ordre' => 0,
            'est_feuille' => true,
            'est_systeme' => true,
            'est_actif' => true,
        ]);

        // Developpement
        $dev = $this->creerActivite([
            'nom' => 'Developpement',
            'code' => 'DEV',
            'parent_id' => null,
            'ordre' => 1,
            'est_feuille' => false,
        ]);

        $devBack = $this->creerActivite([
            'nom' => 'Backend',
            'code' => 'DEV-BACK',
            'parent_id' => $dev->id,
            'parent_chemin' => $dev->chemin,
            'ordre' => 0,
            'est_feuille' => false,
        ]);

        $this->creerActivite([
            'nom' => 'API REST',
            'code' => 'DEV-API',
            'parent_id' => $devBack->id,
            'parent_chemin' => $devBack->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Base de donnees',
            'code' => 'DEV-BDD',
            'parent_id' => $devBack->id,
            'parent_chemin' => $devBack->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Tests backend',
            'code' => 'DEV-TBACK',
            'parent_id' => $devBack->id,
            'parent_chemin' => $devBack->chemin,
            'ordre' => 2,
            'est_feuille' => true,
        ]);

        $devFront = $this->creerActivite([
            'nom' => 'Frontend',
            'code' => 'DEV-FRONT',
            'parent_id' => $dev->id,
            'parent_chemin' => $dev->chemin,
            'ordre' => 1,
            'est_feuille' => false,
        ]);

        $this->creerActivite([
            'nom' => 'Interface utilisateur',
            'code' => 'DEV-UI',
            'parent_id' => $devFront->id,
            'parent_chemin' => $devFront->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Integration API',
            'code' => 'DEV-INTEG',
            'parent_id' => $devFront->id,
            'parent_chemin' => $devFront->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Tests frontend',
            'code' => 'DEV-TFRONT',
            'parent_id' => $devFront->id,
            'parent_chemin' => $devFront->chemin,
            'ordre' => 2,
            'est_feuille' => true,
        ]);

        $devOps = $this->creerActivite([
            'nom' => 'DevOps',
            'code' => 'DEV-OPS',
            'parent_id' => $dev->id,
            'parent_chemin' => $dev->chemin,
            'ordre' => 2,
            'est_feuille' => false,
        ]);

        $this->creerActivite([
            'nom' => 'CI/CD',
            'code' => 'DEV-CICD',
            'parent_id' => $devOps->id,
            'parent_chemin' => $devOps->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Infrastructure',
            'code' => 'DEV-INFRA',
            'parent_id' => $devOps->id,
            'parent_chemin' => $devOps->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        // Gestion de projet
        $gestion = $this->creerActivite([
            'nom' => 'Gestion de projet',
            'code' => 'GEST',
            'parent_id' => null,
            'ordre' => 2,
            'est_feuille' => false,
        ]);

        $reunions = $this->creerActivite([
            'nom' => 'Reunions',
            'code' => 'GEST-REU',
            'parent_id' => $gestion->id,
            'parent_chemin' => $gestion->chemin,
            'ordre' => 0,
            'est_feuille' => false,
        ]);

        $this->creerActivite([
            'nom' => 'Reunions equipe',
            'code' => 'GEST-REUEQ',
            'parent_id' => $reunions->id,
            'parent_chemin' => $reunions->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Reunions client',
            'code' => 'GEST-REUCL',
            'parent_id' => $reunions->id,
            'parent_chemin' => $reunions->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Planification',
            'code' => 'GEST-PLAN',
            'parent_id' => $gestion->id,
            'parent_chemin' => $gestion->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Reporting',
            'code' => 'GEST-REP',
            'parent_id' => $gestion->id,
            'parent_chemin' => $gestion->chemin,
            'ordre' => 2,
            'est_feuille' => true,
        ]);

        // Conception
        $conception = $this->creerActivite([
            'nom' => 'Conception',
            'code' => 'CONC',
            'parent_id' => null,
            'ordre' => 3,
            'est_feuille' => false,
        ]);

        $this->creerActivite([
            'nom' => 'UX Design',
            'code' => 'CONC-UX',
            'parent_id' => $conception->id,
            'parent_chemin' => $conception->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Architecture technique',
            'code' => 'CONC-ARCH',
            'parent_id' => $conception->id,
            'parent_chemin' => $conception->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Redaction specs',
            'code' => 'CONC-SPEC',
            'parent_id' => $conception->id,
            'parent_chemin' => $conception->chemin,
            'ordre' => 2,
            'est_feuille' => true,
        ]);

        // Support
        $support = $this->creerActivite([
            'nom' => 'Support',
            'code' => 'SUP',
            'parent_id' => null,
            'ordre' => 4,
            'est_feuille' => false,
        ]);

        $this->creerActivite([
            'nom' => 'Support N1',
            'code' => 'SUP-N1',
            'parent_id' => $support->id,
            'parent_chemin' => $support->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Support N2',
            'code' => 'SUP-N2',
            'parent_id' => $support->id,
            'parent_chemin' => $support->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Documentation',
            'code' => 'SUP-DOC',
            'parent_id' => $support->id,
            'parent_chemin' => $support->chemin,
            'ordre' => 2,
            'est_feuille' => true,
        ]);

        // Formation
        $formation = $this->creerActivite([
            'nom' => 'Formation',
            'code' => 'FORM',
            'parent_id' => null,
            'ordre' => 5,
            'est_feuille' => false,
        ]);

        $this->creerActivite([
            'nom' => 'Formation interne',
            'code' => 'FORM-INT',
            'parent_id' => $formation->id,
            'parent_chemin' => $formation->chemin,
            'ordre' => 0,
            'est_feuille' => true,
        ]);

        $this->creerActivite([
            'nom' => 'Autoformation',
            'code' => 'FORM-AUTO',
            'parent_id' => $formation->id,
            'parent_chemin' => $formation->chemin,
            'ordre' => 1,
            'est_feuille' => true,
        ]);
    }

    /**
     * Cree 3 projets avec affectations.
     */
    private function creerProjets(): void
    {
        $sand = Project::create([
            'nom' => 'SAND',
            'code' => 'SAND',
            'description' => 'Application de saisie d\'activites numerique declarative',
            'date_debut' => '2025-09-01',
            'est_actif' => true,
        ]);

        $maint = Project::create([
            'nom' => 'Maintenance applicative',
            'code' => 'MAINT',
            'description' => 'Maintenance des applications existantes',
            'date_debut' => '2025-06-01',
            'est_actif' => true,
        ]);

        $portail = Project::create([
            'nom' => 'Portail intranet',
            'code' => 'PORTAIL',
            'description' => 'Refonte du portail intranet de l\'entreprise',
            'date_debut' => '2025-11-01',
            'est_actif' => true,
        ]);

        // Recuperer les utilisateurs
        $marie = User::where('email', 'marie.dupont@sand.local')->first();
        $jean = User::where('email', 'jean.martin@sand.local')->first();
        $pierre = User::where('email', 'pierre.bernard@sand.local')->first();
        $sophie = User::where('email', 'sophie.petit@sand.local')->first();
        $admin = User::where('email', 'admin@sand.local')->first();

        // Marie moderatrice de SAND et PORTAIL
        $sand->moderateurs()->attach($marie);
        $portail->moderateurs()->attach($marie);

        // Affecter les utilisateurs
        $sand->utilisateurs()->attach([$marie->id, $jean->id, $pierre->id, $sophie->id, $admin->id]);
        $maint->utilisateurs()->attach([$jean->id, $pierre->id, $sophie->id]);
        $portail->utilisateurs()->attach([$marie->id, $jean->id, $sophie->id]);
    }

    /**
     * Cree les saisies pour janvier 2026 (jours ouvres du 2 au 30).
     */
    private function creerSaisies(): void
    {
        $marie = User::where('email', 'marie.dupont@sand.local')->first();
        $jean = User::where('email', 'jean.martin@sand.local')->first();
        $pierre = User::where('email', 'pierre.bernard@sand.local')->first();
        $sophie = User::where('email', 'sophie.petit@sand.local')->first();

        $sand = Project::where('code', 'SAND')->first();
        $maint = Project::where('code', 'MAINT')->first();
        $portail = Project::where('code', 'PORTAIL')->first();

        // Recuperer les activites feuilles par code
        $activites = Activity::where('est_feuille', true)->get()->keyBy('code');

        // Jours ouvres de janvier 2026 (1er = ferie, on commence le 2)
        $joursOuvres = [];
        for ($jour = 2; $jour <= 30; $jour++) {
            $date = Carbon::create(2026, 1, $jour);
            // Exclure weekends
            if ($date->isWeekday()) {
                $joursOuvres[] = $date;
            }
        }

        // Profil Jean : dev backend sur SAND + maintenance
        $this->creerSaisiesProfil($jean, $joursOuvres, [
            ['projet' => $sand, 'activite' => $activites['DEV-API'], 'poids' => 0.40],
            ['projet' => $sand, 'activite' => $activites['DEV-BDD'], 'poids' => 0.15],
            ['projet' => $sand, 'activite' => $activites['DEV-TBACK'], 'poids' => 0.10],
            ['projet' => $sand, 'activite' => $activites['GEST-REUEQ'], 'poids' => 0.10],
            ['projet' => $maint, 'activite' => $activites['SUP-N2'], 'poids' => 0.15],
            ['projet' => $maint, 'activite' => $activites['SUP-DOC'], 'poids' => 0.10],
        ]);

        // Profil Pierre : dev frontend sur SAND + maintenance
        $this->creerSaisiesProfil($pierre, $joursOuvres, [
            ['projet' => $sand, 'activite' => $activites['DEV-UI'], 'poids' => 0.35],
            ['projet' => $sand, 'activite' => $activites['DEV-INTEG'], 'poids' => 0.20],
            ['projet' => $sand, 'activite' => $activites['DEV-TFRONT'], 'poids' => 0.10],
            ['projet' => $sand, 'activite' => $activites['GEST-REUEQ'], 'poids' => 0.10],
            ['projet' => $maint, 'activite' => $activites['SUP-N1'], 'poids' => 0.15],
            ['projet' => $maint, 'activite' => $activites['SUP-DOC'], 'poids' => 0.10],
        ]);

        // Profil Marie : gestion + conception sur SAND et PORTAIL
        $this->creerSaisiesProfil($marie, $joursOuvres, [
            ['projet' => $sand, 'activite' => $activites['GEST-PLAN'], 'poids' => 0.20],
            ['projet' => $sand, 'activite' => $activites['GEST-REUCL'], 'poids' => 0.10],
            ['projet' => $sand, 'activite' => $activites['CONC-ARCH'], 'poids' => 0.15],
            ['projet' => $portail, 'activite' => $activites['CONC-UX'], 'poids' => 0.20],
            ['projet' => $portail, 'activite' => $activites['CONC-SPEC'], 'poids' => 0.15],
            ['projet' => $portail, 'activite' => $activites['GEST-REUEQ'], 'poids' => 0.10],
            ['projet' => $sand, 'activite' => $activites['GEST-REP'], 'poids' => 0.10],
        ]);

        // Profil Sophie : support + formation, sur MAINT et PORTAIL
        $this->creerSaisiesProfil($sophie, $joursOuvres, [
            ['projet' => $maint, 'activite' => $activites['SUP-N1'], 'poids' => 0.25],
            ['projet' => $maint, 'activite' => $activites['SUP-N2'], 'poids' => 0.15],
            ['projet' => $maint, 'activite' => $activites['SUP-DOC'], 'poids' => 0.15],
            ['projet' => $portail, 'activite' => $activites['DEV-UI'], 'poids' => 0.20],
            ['projet' => $portail, 'activite' => $activites['GEST-REUEQ'], 'poids' => 0.10],
            ['projet' => $sand, 'activite' => $activites['FORM-AUTO'], 'poids' => 0.15],
        ]);
    }

    /**
     * Cree les saisies pour un utilisateur selon un profil de repartition.
     * Introduit des variations realistes et quelques anomalies volontaires.
     */
    private function creerSaisiesProfil(User $user, array $jours, array $profil): void
    {
        $nbJours = count($jours);

        foreach ($jours as $index => $date) {
            // ~10% des jours : saisie incomplete (anomalie volontaire)
            $totalCible = ($index % 10 === 7) ? 0.75 : 1.0;

            $saisiesJour = [];
            $totalReste = $totalCible;

            // Melanger le profil pour varier les jours
            $profilJour = $profil;

            // Certains jours, ne pas saisir toutes les activites
            if ($index % 5 === 3) {
                // Retirer 1-2 activites faibles pour ce jour
                $profilJour = array_slice($profilJour, 0, max(3, count($profilJour) - 2));
            }

            // Calculer le total des poids pour normaliser
            $totalPoids = array_sum(array_column($profilJour, 'poids'));

            foreach ($profilJour as $i => $item) {
                if ($totalReste <= 0) {
                    break;
                }

                $poidsNormalise = $item['poids'] / $totalPoids * $totalCible;

                // Dernier element : prendre le reste pour que le total = cible
                if ($i === count($profilJour) - 1) {
                    $duree = $totalReste;
                } else {
                    // Ajouter une petite variation (+/- 0.05)
                    $variation = (($index + $i) % 3 - 1) * 0.05;
                    $duree = round($poidsNormalise + $variation, 2);
                    $duree = max(0.05, min($duree, $totalReste));
                }

                // Arrondir a 2 decimales et borner
                $duree = round($duree, 2);
                $duree = max(0.01, min(1.0, $duree));

                if ($duree > $totalReste) {
                    $duree = $totalReste;
                }

                $saisiesJour[] = [
                    'projet' => $item['projet'],
                    'activite' => $item['activite'],
                    'duree' => $duree,
                ];

                $totalReste = round($totalReste - $duree, 2);
            }

            // Creer les saisies en base
            foreach ($saisiesJour as $saisie) {
                $entry = TimeEntry::create([
                    'user_id' => $user->id,
                    'project_id' => $saisie['projet']->id,
                    'activity_id' => $saisie['activite']->id,
                    'date' => $date->format('Y-m-d'),
                    'duree' => $saisie['duree'],
                ]);

                // Log de creation automatique
                TimeEntryLog::logCreation($entry, $user);
            }
        }

        // Ajouter quelques modifications d'historique (3 modifications aleatoires)
        $saisiesExistantes = TimeEntry::where('user_id', $user->id)
            ->inRandomOrder()
            ->limit(3)
            ->get();

        foreach ($saisiesExistantes as $saisie) {
            $ancienneDuree = $saisie->duree;
            $nouvelleDuree = round(max(0.05, min(1.0, $ancienneDuree + 0.10)), 2);
            $saisie->update(['duree' => $nouvelleDuree]);
            TimeEntryLog::logModification($saisie, $user, (float) $ancienneDuree, null);
        }
    }

    /**
     * Cree quelques absences pour tester les conflits.
     */
    private function creerAbsences(): void
    {
        $jean = User::where('email', 'jean.martin@sand.local')->first();
        $sophie = User::where('email', 'sophie.petit@sand.local')->first();

        // Jean : 2 jours de conges le 15-16 janvier
        Absence::create([
            'user_id' => $jean->id,
            'type' => Absence::TYPE_CONGES_PAYES,
            'date_debut' => '2026-01-15',
            'date_fin' => '2026-01-16',
            'duree_journaliere' => 1.0,
            'statut' => Absence::STATUT_VALIDE,
            'reference_externe' => 'RH-2026-001',
            'importe_le' => now(),
        ]);

        // Sophie : 1 jour RTT le 23 janvier
        Absence::create([
            'user_id' => $sophie->id,
            'type' => Absence::TYPE_RTT,
            'date_debut' => '2026-01-23',
            'date_fin' => '2026-01-23',
            'duree_journaliere' => 1.0,
            'statut' => Absence::STATUT_VALIDE,
            'reference_externe' => 'RH-2026-002',
            'importe_le' => now(),
        ]);

        // Jean : maladie le 28 janvier
        Absence::create([
            'user_id' => $jean->id,
            'type' => Absence::TYPE_MALADIE,
            'date_debut' => '2026-01-28',
            'date_fin' => '2026-01-28',
            'duree_journaliere' => 1.0,
            'statut' => Absence::STATUT_VALIDE,
            'reference_externe' => 'RH-2026-003',
            'importe_le' => now(),
        ]);
    }

    /**
     * Cree une activite avec calcul automatique du chemin ltree.
     */
    private function creerActivite(array $data): Activity
    {
        $nextId = DB::selectOne("SELECT nextval('activities_id_seq') AS id")->id;

        $parentChemin = $data['parent_chemin'] ?? null;
        unset($data['parent_chemin']);

        $chemin = $data['parent_id']
            ? "{$parentChemin}.{$nextId}"
            : (string) $nextId;

        return Activity::create([
            'id' => $nextId,
            'nom' => $data['nom'],
            'code' => $data['code'] ?? null,
            'description' => $data['description'] ?? null,
            'parent_id' => $data['parent_id'] ?? null,
            'chemin' => $chemin,
            'ordre' => $data['ordre'] ?? 0,
            'est_feuille' => $data['est_feuille'] ?? true,
            'est_systeme' => $data['est_systeme'] ?? false,
            'est_actif' => $data['est_actif'] ?? true,
        ]);
    }
}
