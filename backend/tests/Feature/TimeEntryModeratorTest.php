<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Team;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class TimeEntryModeratorTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $moderateur;
    private User $utilisateur;
    private User $admin;
    private User $autreUtilisateur;
    private Project $projetModere;
    private Project $autreProjet;
    private Activity $activity;

    protected function setUp(): void
    {
        parent::setUp();

        $team = Team::factory()->create();

        $this->moderateur = User::factory()->create([
            'equipe_id' => $team->id,
            'role' => 'moderateur',
        ]);
        $this->utilisateur = User::factory()->create([
            'equipe_id' => $team->id,
            'role' => 'utilisateur',
        ]);
        $this->autreUtilisateur = User::factory()->create([
            'equipe_id' => $team->id,
            'role' => 'utilisateur',
        ]);
        $this->admin = User::factory()->create([
            'equipe_id' => $team->id,
            'role' => 'admin',
        ]);

        $this->projetModere = Project::factory()->create();
        $this->autreProjet = Project::factory()->create();

        // Assigner le moderateur au projet
        $this->projetModere->moderateurs()->attach($this->moderateur->id);

        $this->activity = Activity::factory()->create([
            'est_feuille' => true,
            'est_systeme' => false,
        ]);
    }

    // ─── Creation pour autrui ─────────────────────────

    public function test_moderateur_peut_creer_saisie_pour_utilisateur_sur_projet_modere(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) {
                    id
                    duree
                    utilisateur { id }
                    projet { id }
                }
            }
        ', [
            'input' => [
                'projetId' => $this->projetModere->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-02-03',
                'duree' => 0.5,
                'userId' => $this->utilisateur->id,
            ],
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createTimeEntry');

        $this->assertEquals($this->utilisateur->id, $data['utilisateur']['id']);
        $this->assertEquals($this->projetModere->id, $data['projet']['id']);

        // Verifier en base que c'est bien l'utilisateur cible
        $this->assertDatabaseHas('time_entries', [
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projetModere->id,
            'duree' => 0.5,
        ]);
    }

    public function test_moderateur_ne_peut_pas_creer_saisie_sur_projet_non_modere(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) { id }
            }
        ', [
            'input' => [
                'projetId' => $this->autreProjet->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-02-03',
                'duree' => 0.5,
                'userId' => $this->utilisateur->id,
            ],
        ], $this->moderateur);

        $this->assertGraphQLError($response);
    }

    public function test_utilisateur_normal_ne_peut_pas_creer_pour_autrui(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) { id }
            }
        ', [
            'input' => [
                'projetId' => $this->projetModere->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-02-03',
                'duree' => 0.5,
                'userId' => $this->autreUtilisateur->id,
            ],
        ], $this->utilisateur);

        $this->assertGraphQLError($response);
    }

    public function test_admin_peut_creer_saisie_pour_nimporte_qui(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) {
                    id
                    utilisateur { id }
                }
            }
        ', [
            'input' => [
                'projetId' => $this->autreProjet->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-02-03',
                'duree' => 0.5,
                'userId' => $this->utilisateur->id,
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createTimeEntry');
        $this->assertEquals($this->utilisateur->id, $data['utilisateur']['id']);
    }

    // ─── Consultation saisies ─────────────────────────

    public function test_moderateur_peut_voir_saisies_semaine_utilisateur_projet_modere(): void
    {
        // Creer des saisies pour l'utilisateur sur le projet modere
        TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projetModere->id,
            'activity_id' => $this->activity->id,
            'date' => '2026-02-03',
            'duree' => 0.5,
        ]);

        $response = $this->graphqlAsUser('
            query MesSaisiesSemaine($semaine: String!, $userId: ID) {
                mesSaisiesSemaine(semaine: $semaine, userId: $userId) {
                    id
                    duree
                    projet { id }
                }
            }
        ', [
            'semaine' => '2026-W06',
            'userId' => $this->utilisateur->id,
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'mesSaisiesSemaine');
        $this->assertCount(1, $data);
        $this->assertEquals($this->projetModere->id, $data[0]['projet']['id']);
    }

    public function test_moderateur_ne_voit_pas_saisies_autres_projets(): void
    {
        // Saisie sur projet modere (visible)
        TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projetModere->id,
            'activity_id' => $this->activity->id,
            'date' => '2026-02-03',
            'duree' => 0.25,
        ]);

        // Saisie sur autre projet (invisible pour le moderateur)
        TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->autreProjet->id,
            'activity_id' => $this->activity->id,
            'date' => '2026-02-04',
            'duree' => 0.75,
        ]);

        $response = $this->graphqlAsUser('
            query MesSaisiesSemaine($semaine: String!, $userId: ID) {
                mesSaisiesSemaine(semaine: $semaine, userId: $userId) {
                    id
                    projet { id }
                }
            }
        ', [
            'semaine' => '2026-W06',
            'userId' => $this->utilisateur->id,
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'mesSaisiesSemaine');

        // Seule la saisie du projet modere est visible
        $this->assertCount(1, $data);
        $this->assertEquals($this->projetModere->id, $data[0]['projet']['id']);
    }

    public function test_utilisateur_ne_peut_pas_voir_saisies_autrui(): void
    {
        TimeEntry::factory()->create([
            'user_id' => $this->autreUtilisateur->id,
            'project_id' => $this->projetModere->id,
            'activity_id' => $this->activity->id,
            'date' => '2026-02-03',
            'duree' => 0.5,
        ]);

        $response = $this->graphqlAsUser('
            query MesSaisiesSemaine($semaine: String!, $userId: ID) {
                mesSaisiesSemaine(semaine: $semaine, userId: $userId) { id }
            }
        ', [
            'semaine' => '2026-W06',
            'userId' => $this->autreUtilisateur->id,
        ], $this->utilisateur);

        $this->assertGraphQLError($response);
    }

    // ─── Modification / suppression par moderateur ────

    public function test_moderateur_peut_modifier_saisie_projet_modere(): void
    {
        $saisie = TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projetModere->id,
            'activity_id' => $this->activity->id,
            'duree' => 0.5,
        ]);

        $response = $this->graphqlAsUser('
            mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {
                updateTimeEntry(id: $id, input: $input) {
                    id
                    duree
                }
            }
        ', [
            'id' => $saisie->id,
            'input' => [
                'projetId' => $this->projetModere->id,
                'activiteId' => $this->activity->id,
                'date' => $saisie->date->format('Y-m-d'),
                'duree' => 0.75,
            ],
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateTimeEntry');
        $this->assertEquals(0.75, $data['duree']);
    }

    public function test_moderateur_peut_supprimer_saisie_projet_modere(): void
    {
        $saisie = TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projetModere->id,
            'activity_id' => $this->activity->id,
        ]);

        $response = $this->graphqlAsUser('
            mutation DeleteTimeEntry($id: ID!) {
                deleteTimeEntry(id: $id)
            }
        ', ['id' => $saisie->id], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $this->assertSoftDeleted('time_entries', ['id' => $saisie->id]);
    }

    // ─── Bulk creation pour autrui ────────────────────

    public function test_moderateur_peut_creer_en_lot_pour_utilisateur(): void
    {
        $activity2 = Activity::factory()->create(['est_feuille' => true]);

        $response = $this->graphqlAsUser('
            mutation BulkCreate($inputs: [TimeEntryInput!]!) {
                bulkCreateTimeEntries(inputs: $inputs) {
                    id
                    duree
                    utilisateur { id }
                }
            }
        ', [
            'inputs' => [
                [
                    'projetId' => $this->projetModere->id,
                    'activiteId' => $this->activity->id,
                    'date' => '2026-02-03',
                    'duree' => 0.5,
                    'userId' => $this->utilisateur->id,
                ],
                [
                    'projetId' => $this->projetModere->id,
                    'activiteId' => $activity2->id,
                    'date' => '2026-02-03',
                    'duree' => 0.5,
                    'userId' => $this->utilisateur->id,
                ],
            ],
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'bulkCreateTimeEntries');
        $this->assertCount(2, $data);
        $this->assertEquals($this->utilisateur->id, $data[0]['utilisateur']['id']);
    }

    // ─── Query utilisateursModerables ─────────────────

    public function test_moderateur_voit_utilisateurs_de_ses_projets(): void
    {
        // L'utilisateur a des saisies sur le projet modere
        TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $this->projetModere->id,
            'activity_id' => $this->activity->id,
            'date' => '2026-02-03',
            'duree' => 0.5,
        ]);

        $response = $this->graphqlAsUser('
            query {
                utilisateursModerables {
                    id
                    nom
                    prenom
                }
            }
        ', [], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'utilisateursModerables');

        $ids = array_column($data, 'id');
        $this->assertContains((string) $this->utilisateur->id, $ids);
        // L'autre utilisateur n'a pas de saisie sur le projet modere
        $this->assertNotContains((string) $this->autreUtilisateur->id, $ids);
        // Le moderateur ne se voit pas lui-meme
        $this->assertNotContains((string) $this->moderateur->id, $ids);
    }

    public function test_utilisateur_normal_voit_liste_vide(): void
    {
        $response = $this->graphqlAsUser('
            query {
                utilisateursModerables {
                    id
                }
            }
        ', [], $this->utilisateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'utilisateursModerables');
        $this->assertCount(0, $data);
    }

    public function test_admin_voit_tous_les_utilisateurs(): void
    {
        $response = $this->graphqlAsUser('
            query {
                utilisateursModerables {
                    id
                }
            }
        ', [], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'utilisateursModerables');

        $ids = array_column($data, 'id');
        // Admin voit les autres utilisateurs (pas lui-meme)
        $this->assertContains((string) $this->utilisateur->id, $ids);
        $this->assertContains((string) $this->moderateur->id, $ids);
        $this->assertNotContains((string) $this->admin->id, $ids);
    }

    // ─── Audit trail ──────────────────────────────────

    public function test_audit_log_enregistre_moderateur_comme_auteur(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'projetId' => $this->projetModere->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-02-03',
                'duree' => 0.5,
                'userId' => $this->utilisateur->id,
            ],
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);

        // Verifier que le log enregistre le moderateur comme auteur
        $this->assertDatabaseHas('time_entry_logs', [
            'user_id' => $this->moderateur->id,
            'action' => 'creation',
        ]);
    }
}
