<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Absence;
use App\Models\Activity;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Team;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class AbsenceMutatorGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;
    private User $moderateur;
    private User $utilisateur;
    private Team $team;
    private Project $project;
    private Activity $activity;

    protected function setUp(): void
    {
        parent::setUp();

        // Donnees de base
        $this->team = Team::factory()->create();
        $this->admin = User::factory()->admin()->create(['equipe_id' => $this->team->id]);
        $this->moderateur = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $this->utilisateur = User::factory()->create(['equipe_id' => $this->team->id]);

        $this->project = Project::factory()->create();
        $this->activity = Activity::factory()->create(['est_feuille' => true]);
    }

    public function test_admin_peut_creer_absence_manuellement(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateAbsence($input: AbsenceInput!) {
                createAbsence(input: $input) {
                    id
                    type
                    dateDebut
                    dateFin
                    dureeJournaliere
                    statut
                    utilisateur {
                        id
                    }
                }
            }
        ', [
            'input' => [
                'userId' => (string) $this->utilisateur->id,
                'type' => 'conges_payes',
                'dateDebut' => '2026-03-10',
                'dateFin' => '2026-03-14',
                'dureeJournaliere' => 1.0,
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createAbsence');

        $this->assertEquals('conges_payes', $data['type']);
        $this->assertEquals('2026-03-10', $data['dateDebut']);
        $this->assertEquals('2026-03-14', $data['dateFin']);
        $this->assertEquals(1.0, $data['dureeJournaliere']);
        $this->assertEquals('valide', $data['statut']);
        $this->assertEquals($this->utilisateur->id, $data['utilisateur']['id']);

        // Verifier en base
        $this->assertDatabaseHas('absences', [
            'user_id' => $this->utilisateur->id,
            'type' => 'conges_payes',
            'date_debut' => '2026-03-10',
            'date_fin' => '2026-03-14',
            'statut' => 'valide',
        ]);
    }

    public function test_moderateur_peut_creer_absence(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateAbsence($input: AbsenceInput!) {
                createAbsence(input: $input) {
                    id
                    type
                    statut
                }
            }
        ', [
            'input' => [
                'userId' => (string) $this->utilisateur->id,
                'type' => 'rtt',
                'dateDebut' => '2026-03-15',
                'dateFin' => '2026-03-15',
            ],
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createAbsence');

        $this->assertEquals('rtt', $data['type']);
        $this->assertEquals('valide', $data['statut']);

        $this->assertDatabaseHas('absences', [
            'user_id' => $this->utilisateur->id,
            'type' => 'rtt',
            'statut' => 'valide',
        ]);
    }

    public function test_utilisateur_ne_peut_pas_creer_absence(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateAbsence($input: AbsenceInput!) {
                createAbsence(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'userId' => (string) $this->utilisateur->id,
                'type' => 'maladie',
                'dateDebut' => '2026-03-20',
                'dateFin' => '2026-03-21',
            ],
        ], $this->utilisateur);

        $this->assertGraphQLError($response);

        // Verifier qu'aucune absence n'a ete creee
        $this->assertDatabaseMissing('absences', [
            'user_id' => $this->utilisateur->id,
            'type' => 'maladie',
        ]);
    }

    public function test_non_authentifie_ne_peut_pas_creer_absence(): void
    {
        $response = $this->graphql('
            mutation CreateAbsence($input: AbsenceInput!) {
                createAbsence(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'userId' => (string) $this->utilisateur->id,
                'type' => 'formation',
                'dateDebut' => '2026-04-01',
                'dateFin' => '2026-04-05',
            ],
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }

    public function test_resolution_conflit_ecraser_supprime_saisies(): void
    {
        // Creer une absence
        $absence = Absence::create([
            'user_id' => $this->utilisateur->id,
            'type' => Absence::TYPE_CONGES_PAYES,
            'date_debut' => '2026-03-10',
            'date_fin' => '2026-03-12',
            'duree_journaliere' => 1.0,
            'statut' => Absence::STATUT_VALIDE,
        ]);

        // Creer des saisies en conflit avec l'absence
        $saisie1 = TimeEntry::create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->project->id,
            'activity_id' => $this->activity->id,
            'date' => '2026-03-10',
            'duree' => 0.5,
        ]);

        $saisie2 = TimeEntry::create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->project->id,
            'activity_id' => $this->activity->id,
            'date' => '2026-03-11',
            'duree' => 1.0,
        ]);

        // Creer une notification de conflit
        Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_CONFLIT_ABSENCE,
            'titre' => 'Conflit absence/saisie detecte',
            'message' => 'Test conflit',
            'donnees' => [
                'absence_id' => $absence->id,
                'saisie_ids' => [$saisie1->id, $saisie2->id],
            ],
            'est_lu' => false,
        ]);

        // Resoudre le conflit en ECRASANT les saisies
        $response = $this->graphqlAsUser('
            mutation ResolveConflict($absenceId: ID!, $resolution: ConflictResolution!) {
                resolveAbsenceConflict(absenceId: $absenceId, resolution: $resolution)
            }
        ', [
            'absenceId' => (string) $absence->id,
            'resolution' => 'ECRASER',
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'resolveAbsenceConflict'));

        // Verifier que les saisies sont soft-deleted
        $this->assertSoftDeleted('time_entries', ['id' => $saisie1->id]);
        $this->assertSoftDeleted('time_entries', ['id' => $saisie2->id]);

        // Verifier que l'absence est toujours valide
        $absence->refresh();
        $this->assertEquals(Absence::STATUT_VALIDE, $absence->statut);

        // Verifier que la notification a ete marquee comme lue
        $notification = Notification::where('user_id', $this->utilisateur->id)
            ->where('type', Notification::TYPE_CONFLIT_ABSENCE)
            ->first();
        $this->assertTrue($notification->est_lu);
        $this->assertNotNull($notification->lu_le);
    }

    public function test_resolution_conflit_ignorer_annule_absence(): void
    {
        // Creer une absence
        $absence = Absence::create([
            'user_id' => $this->utilisateur->id,
            'type' => Absence::TYPE_RTT,
            'date_debut' => '2026-03-20',
            'date_fin' => '2026-03-20',
            'duree_journaliere' => 1.0,
            'statut' => Absence::STATUT_VALIDE,
        ]);

        // Creer une saisie en conflit
        $saisie = TimeEntry::create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->project->id,
            'activity_id' => $this->activity->id,
            'date' => '2026-03-20',
            'duree' => 0.75,
        ]);

        // Creer une notification de conflit
        Notification::create([
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_CONFLIT_ABSENCE,
            'titre' => 'Conflit absence/saisie detecte',
            'message' => 'Test conflit',
            'donnees' => [
                'absence_id' => $absence->id,
                'saisie_ids' => [$saisie->id],
            ],
            'est_lu' => false,
        ]);

        // Resoudre le conflit en IGNORANT l'absence
        $response = $this->graphqlAsUser('
            mutation ResolveConflict($absenceId: ID!, $resolution: ConflictResolution!) {
                resolveAbsenceConflict(absenceId: $absenceId, resolution: $resolution)
            }
        ', [
            'absenceId' => (string) $absence->id,
            'resolution' => 'IGNORER',
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'resolveAbsenceConflict'));

        // Verifier que l'absence a ete annulee
        $absence->refresh();
        $this->assertEquals(Absence::STATUT_ANNULE, $absence->statut);

        // Verifier que la saisie existe toujours (non supprimee)
        $this->assertDatabaseHas('time_entries', [
            'id' => $saisie->id,
            'deleted_at' => null,
        ]);

        // Verifier que la notification a ete marquee comme lue
        $notification = Notification::where('user_id', $this->utilisateur->id)
            ->where('type', Notification::TYPE_CONFLIT_ABSENCE)
            ->first();
        $this->assertTrue($notification->est_lu);
    }

    public function test_utilisateur_peut_declarer_sa_propre_absence(): void
    {
        // Le mode 'manuel' est la valeur par defaut quand aucun setting n'existe
        $response = $this->graphqlAsUser('
            mutation DeclarerAbsence($date: Date!, $duree: Float) {
                declarerAbsence(date: $date, duree: $duree)
            }
        ', [
            'date' => '2026-03-10',
            'duree' => 1.0,
        ], $this->utilisateur);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'declarerAbsence'));

        $this->assertDatabaseHas('absences', [
            'user_id' => $this->utilisateur->id,
            'date_debut' => '2026-03-10',
            'date_fin' => '2026-03-10',
            'duree_journaliere' => 1.0,
        ]);
    }

    public function test_declarer_absence_envoie_notification(): void
    {
        $this->graphqlAsUser('
            mutation DeclarerAbsence($date: Date!, $duree: Float) {
                declarerAbsence(date: $date, duree: $duree)
            }
        ', [
            'date' => '2026-03-11',
            'duree' => 0.5,
        ], $this->utilisateur);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_ABSENCE_IMPORTEE,
        ]);
    }

    public function test_utilisateur_ne_peut_pas_declarer_absence_pour_autre(): void
    {
        $autreUser = User::factory()->create(['equipe_id' => $this->team->id]);

        $response = $this->graphqlAsUser('
            mutation DeclarerAbsence($date: Date!, $duree: Float, $userId: ID) {
                declarerAbsence(date: $date, duree: $duree, userId: $userId)
            }
        ', [
            'date' => '2026-03-12',
            'duree' => 1.0,
            'userId' => (string) $autreUser->id,
        ], $this->utilisateur);

        $this->assertGraphQLError($response);
        $this->assertDatabaseMissing('absences', ['user_id' => $autreUser->id]);
    }

    public function test_moderateur_peut_declarer_absence_pour_autre(): void
    {
        $response = $this->graphqlAsUser('
            mutation DeclarerAbsence($date: Date!, $duree: Float, $userId: ID) {
                declarerAbsence(date: $date, duree: $duree, userId: $userId)
            }
        ', [
            'date' => '2026-03-13',
            'duree' => 1.0,
            'userId' => (string) $this->utilisateur->id,
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $this->assertDatabaseHas('absences', [
            'user_id' => $this->utilisateur->id,
            'date_debut' => '2026-03-13',
        ]);
    }

    public function test_creer_absence_duree_invalide_echoue(): void
    {
        // Tenter de creer une absence avec dureeJournaliere hors limites (> 1)
        $response = $this->graphqlAsUser('
            mutation CreateAbsence($input: AbsenceInput!) {
                createAbsence(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'userId' => (string) $this->utilisateur->id,
                'type' => 'conges_payes',
                'dateDebut' => '2026-04-10',
                'dateFin' => '2026-04-15',
                'dureeJournaliere' => 2.0,
            ],
        ], $this->admin);

        $this->assertGraphQLError($response);
    }

    public function test_declarer_absence_suppression_ne_cree_pas_notification(): void
    {
        // Creer une absence existante a supprimer
        Absence::create([
            'user_id' => $this->utilisateur->id,
            'date_debut' => '2026-04-20',
            'date_fin' => '2026-04-20',
            'type' => Absence::TYPE_AUTRE,
            'duree_journaliere' => 1.0,
            'statut' => Absence::STATUT_VALIDE,
        ]);

        // Appeler declarerAbsence sans duree (= suppression)
        $response = $this->graphqlAsUser('
            mutation DeclarerAbsence($date: Date!, $duree: Float) {
                declarerAbsence(date: $date, duree: $duree)
            }
        ', [
            'date' => '2026-04-20',
            'duree' => null,
        ], $this->utilisateur);

        $this->assertGraphQLSuccess($response);

        // L'absence doit etre supprimee (soft delete)
        $this->assertDatabaseMissing('absences', [
            'user_id' => $this->utilisateur->id,
            'date_debut' => '2026-04-20',
            'deleted_at' => null,
        ]);

        // Aucune notification ne doit avoir ete creee
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_ABSENCE_IMPORTEE,
        ]);
    }

    public function test_moderateur_declarant_pour_autre_notifie_utilisateur_cible(): void
    {
        // Le moderateur declare une absence pour $utilisateur
        $response = $this->graphqlAsUser('
            mutation DeclarerAbsence($date: Date!, $duree: Float, $userId: ID) {
                declarerAbsence(date: $date, duree: $duree, userId: $userId)
            }
        ', [
            'date' => '2026-04-25',
            'duree' => 0.5,
            'userId' => (string) $this->utilisateur->id,
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);

        // La notification doit etre destinee a l'utilisateur cible, pas au moderateur
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->utilisateur->id,
            'type' => Notification::TYPE_ABSENCE_IMPORTEE,
        ]);
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $this->moderateur->id,
            'type' => Notification::TYPE_ABSENCE_IMPORTEE,
        ]);
    }
}
