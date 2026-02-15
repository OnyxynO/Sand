<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Absence;
use App\Models\Activity;
use App\Models\ActivityUserVisibility;
use App\Models\Export;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Team;
use App\Models\TimeEntry;
use App\Models\TimeEntryLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class RgpdTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;
    private User $utilisateur;
    private Team $equipe;
    private Project $projet;
    private Activity $activite;

    protected function setUp(): void
    {
        parent::setUp();

        $this->equipe = Team::factory()->create();
        $this->admin = User::factory()->admin()->create(['equipe_id' => $this->equipe->id]);
        $this->utilisateur = User::factory()->create([
            'equipe_id' => $this->equipe->id,
            'prenom' => 'Jean',
            'nom' => 'Martin',
        ]);
        $this->projet = Project::factory()->create();
        $this->activite = Activity::factory()->create();
    }

    // --- EV-06a : Suppression donnees utilisateur ---

    public function test_admin_peut_supprimer_donnees_utilisateur(): void
    {
        // Creer des donnees pour l'utilisateur
        $saisie = TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
        ]);

        TimeEntryLog::logCreation($saisie, $this->utilisateur);

        Absence::create([
            'user_id' => $this->utilisateur->id,
            'type' => 'conge',
            'date_debut' => '2026-01-01',
            'date_fin' => '2026-01-05',
            'source' => 'rh',
        ]);

        Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => 'rappel_saisie',
            'titre' => 'Test',
            'message' => 'Test notification',
        ]);

        $response = $this->graphqlAsUser('
            mutation SupprimerDonnees($userId: ID!, $confirmationNom: String!) {
                supprimerDonneesUtilisateur(userId: $userId, confirmationNom: $confirmationNom) {
                    saisiesSupprimees
                    absencesSupprimees
                    notificationsSupprimees
                    exportsSupprimees
                    logsAnonymises
                }
            }
        ', [
            'userId' => (string) $this->utilisateur->id,
            'confirmationNom' => 'Jean Martin',
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'supprimerDonneesUtilisateur');

        $this->assertEquals(1, $data['saisiesSupprimees']);
        $this->assertEquals(1, $data['absencesSupprimees']);
        $this->assertEquals(1, $data['notificationsSupprimees']);
        $this->assertEquals(0, $data['exportsSupprimees']);

        // Verifier que les saisies sont supprimees (hard delete)
        $this->assertDatabaseMissing('time_entries', ['user_id' => $this->utilisateur->id]);

        // Verifier que les logs lies aux saisies sont supprimes
        $this->assertEquals(0, TimeEntryLog::count());

        // Verifier que les absences sont supprimees
        $this->assertDatabaseMissing('absences', ['user_id' => $this->utilisateur->id]);
    }

    public function test_logs_moderateur_sont_anonymises(): void
    {
        // L'utilisateur a modifie la saisie d'un autre (cas moderateur)
        $saisieAdmin = TimeEntry::factory()->create([
            'user_id' => $this->admin->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
        ]);

        // L'utilisateur a cree/modifie la saisie de l'admin (en tant que moderateur)
        TimeEntryLog::logCreation($saisieAdmin, $this->utilisateur);
        TimeEntryLog::logModification($saisieAdmin, $this->utilisateur, 0.50, null);

        $response = $this->graphqlAsUser('
            mutation SupprimerDonnees($userId: ID!, $confirmationNom: String!) {
                supprimerDonneesUtilisateur(userId: $userId, confirmationNom: $confirmationNom) {
                    logsAnonymises
                }
            }
        ', [
            'userId' => (string) $this->utilisateur->id,
            'confirmationNom' => 'Jean Martin',
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'supprimerDonneesUtilisateur');

        // Les 2 logs sont anonymises (pas supprimes car lies a la saisie de l'admin)
        $this->assertEquals(2, $data['logsAnonymises']);

        $logs = TimeEntryLog::where('user_id', $this->utilisateur->id)->get();
        $this->assertCount(2, $logs);
        $this->assertTrue($logs->every(fn($log) => $log->user_anonymise));
    }

    public function test_non_admin_ne_peut_pas_supprimer_donnees(): void
    {
        $response = $this->graphqlAsUser('
            mutation SupprimerDonnees($userId: ID!, $confirmationNom: String!) {
                supprimerDonneesUtilisateur(userId: $userId, confirmationNom: $confirmationNom) {
                    saisiesSupprimees
                }
            }
        ', [
            'userId' => (string) $this->utilisateur->id,
            'confirmationNom' => 'Jean Martin',
        ], $this->utilisateur);

        $this->assertGraphQLError($response);
    }

    public function test_mauvais_nom_confirmation_refuse(): void
    {
        $response = $this->graphqlAsUser('
            mutation SupprimerDonnees($userId: ID!, $confirmationNom: String!) {
                supprimerDonneesUtilisateur(userId: $userId, confirmationNom: $confirmationNom) {
                    saisiesSupprimees
                }
            }
        ', [
            'userId' => (string) $this->utilisateur->id,
            'confirmationNom' => 'Mauvais Nom',
        ], $this->admin);

        $this->assertGraphQLError($response);
    }

    // --- EV-06b : Purge totale ---

    public function test_admin_peut_purger_toutes_donnees(): void
    {
        // Creer des donnees pour plusieurs utilisateurs
        $saisie1 = TimeEntry::factory()->create([
            'user_id' => $this->admin->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
        ]);
        $saisie2 = TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
        ]);

        TimeEntryLog::logCreation($saisie1, $this->admin);
        TimeEntryLog::logCreation($saisie2, $this->utilisateur);

        Absence::create([
            'user_id' => $this->utilisateur->id,
            'type' => 'conge',
            'date_debut' => '2026-01-01',
            'date_fin' => '2026-01-05',
            'source' => 'rh',
        ]);

        $response = $this->graphqlAsUser('
            mutation PurgerDonnees($confirmationPhrase: String!) {
                purgerToutesDonnees(confirmationPhrase: $confirmationPhrase) {
                    saisiesSupprimees
                    logsSupprimees
                    absencesSupprimees
                    notificationsSupprimees
                    exportsSupprimees
                }
            }
        ', [
            'confirmationPhrase' => 'CONFIRMER SUPPRESSION',
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'purgerToutesDonnees');

        $this->assertEquals(2, $data['saisiesSupprimees']);
        $this->assertEquals(2, $data['logsSupprimees']);
        $this->assertEquals(1, $data['absencesSupprimees']);
    }

    public function test_purge_conserve_structure(): void
    {
        TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projet->id,
            'activity_id' => $this->activite->id,
        ]);

        $this->graphqlAsUser('
            mutation PurgerDonnees($confirmationPhrase: String!) {
                purgerToutesDonnees(confirmationPhrase: $confirmationPhrase) {
                    saisiesSupprimees
                }
            }
        ', [
            'confirmationPhrase' => 'CONFIRMER SUPPRESSION',
        ], $this->admin);

        // La structure est conservee
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
        $this->assertDatabaseHas('users', ['id' => $this->utilisateur->id]);
        $this->assertDatabaseHas('teams', ['id' => $this->equipe->id]);
        $this->assertDatabaseHas('projects', ['id' => $this->projet->id]);
        $this->assertDatabaseHas('activities', ['id' => $this->activite->id]);

        // Les donnees transactionnelles sont supprimees
        $this->assertEquals(0, TimeEntry::withTrashed()->count());
        $this->assertEquals(0, TimeEntryLog::count());
    }

    public function test_non_admin_ne_peut_pas_purger(): void
    {
        $response = $this->graphqlAsUser('
            mutation PurgerDonnees($confirmationPhrase: String!) {
                purgerToutesDonnees(confirmationPhrase: $confirmationPhrase) {
                    saisiesSupprimees
                }
            }
        ', [
            'confirmationPhrase' => 'CONFIRMER SUPPRESSION',
        ], $this->utilisateur);

        $this->assertGraphQLError($response);
    }

    public function test_mauvaise_phrase_confirmation_purge_refuse(): void
    {
        $response = $this->graphqlAsUser('
            mutation PurgerDonnees($confirmationPhrase: String!) {
                purgerToutesDonnees(confirmationPhrase: $confirmationPhrase) {
                    saisiesSupprimees
                }
            }
        ', [
            'confirmationPhrase' => 'mauvaise phrase',
        ], $this->admin);

        $this->assertGraphQLError($response);
    }
}
