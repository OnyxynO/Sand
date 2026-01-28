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

class TimeEntryGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $user;
    private Project $project;
    private Activity $activity;

    protected function setUp(): void
    {
        parent::setUp();

        // Donnees de base
        $team = Team::factory()->create();
        $this->user = User::factory()->create(['equipe_id' => $team->id]);
        $this->project = Project::factory()->create();
        $this->activity = Activity::factory()->create([
            'est_feuille' => true,
            'est_systeme' => false,
        ]);
    }

    public function test_creer_une_saisie_de_temps(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) {
                    id
                    date
                    duree
                    commentaire
                    projet { id }
                    activite { id }
                }
            }
        ', [
            'input' => [
                'projetId' => $this->project->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-01-28',
                'duree' => 0.5,
                'commentaire' => 'Test saisie',
            ],
        ], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createTimeEntry');

        $this->assertEquals('2026-01-28', $data['date']);
        $this->assertEquals(0.5, $data['duree']);
        $this->assertEquals('Test saisie', $data['commentaire']);
        $this->assertEquals($this->project->id, $data['projet']['id']);

        // Verifier en base
        $this->assertDatabaseHas('time_entries', [
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
            'activity_id' => $this->activity->id,
            'duree' => 0.5,
        ]);
    }

    public function test_creer_saisie_sans_authentification_echoue(): void
    {
        $response = $this->graphql('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'projetId' => $this->project->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-01-28',
                'duree' => 0.5,
            ],
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }

    public function test_duree_doit_etre_entre_001_et_100(): void
    {
        // Duree trop petite
        $response = $this->graphqlAsUser('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) { id }
            }
        ', [
            'input' => [
                'projetId' => $this->project->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-01-28',
                'duree' => 0.001,
            ],
        ], $this->user);

        $this->assertGraphQLError($response);

        // Duree trop grande
        $response = $this->graphqlAsUser('
            mutation CreateTimeEntry($input: TimeEntryInput!) {
                createTimeEntry(input: $input) { id }
            }
        ', [
            'input' => [
                'projetId' => $this->project->id,
                'activiteId' => $this->activity->id,
                'date' => '2026-01-29',
                'duree' => 1.5,
            ],
        ], $this->user);

        $this->assertGraphQLError($response);
    }

    public function test_modifier_une_saisie(): void
    {
        $saisie = TimeEntry::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
            'activity_id' => $this->activity->id,
            'duree' => 0.5,
            'commentaire' => 'Original',
        ]);

        $response = $this->graphqlAsUser('
            mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {
                updateTimeEntry(id: $id, input: $input) {
                    id
                    duree
                    commentaire
                }
            }
        ', [
            'id' => $saisie->id,
            'input' => [
                'projetId' => $this->project->id,
                'activiteId' => $this->activity->id,
                'date' => $saisie->date->format('Y-m-d'),
                'duree' => 0.75,
                'commentaire' => 'Modifie',
            ],
        ], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateTimeEntry');

        $this->assertEquals(0.75, $data['duree']);
        $this->assertEquals('Modifie', $data['commentaire']);
    }

    public function test_supprimer_une_saisie(): void
    {
        $saisie = TimeEntry::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
            'activity_id' => $this->activity->id,
        ]);

        $response = $this->graphqlAsUser('
            mutation DeleteTimeEntry($id: ID!) {
                deleteTimeEntry(id: $id)
            }
        ', ['id' => $saisie->id], $this->user);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'deleteTimeEntry'));

        // Soft delete
        $this->assertSoftDeleted('time_entries', ['id' => $saisie->id]);
    }

    public function test_ne_peut_pas_modifier_saisie_autre_utilisateur(): void
    {
        $autreUser = User::factory()->create();
        $saisie = TimeEntry::factory()->create([
            'user_id' => $autreUser->id,
            'project_id' => $this->project->id,
            'activity_id' => $this->activity->id,
        ]);

        $response = $this->graphqlAsUser('
            mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {
                updateTimeEntry(id: $id, input: $input) { id }
            }
        ', [
            'id' => $saisie->id,
            'input' => [
                'projetId' => $this->project->id,
                'activiteId' => $this->activity->id,
                'date' => $saisie->date->format('Y-m-d'),
                'duree' => 0.75,
            ],
        ], $this->user);

        $this->assertGraphQLError($response);
    }

    public function test_creer_saisies_en_lot(): void
    {
        $activity2 = Activity::factory()->create(['est_feuille' => true]);

        $response = $this->graphqlAsUser('
            mutation BulkCreate($inputs: [TimeEntryInput!]!) {
                bulkCreateTimeEntries(inputs: $inputs) {
                    id
                    duree
                }
            }
        ', [
            'inputs' => [
                [
                    'projetId' => $this->project->id,
                    'activiteId' => $this->activity->id,
                    'date' => '2026-01-28',
                    'duree' => 0.5,
                ],
                [
                    'projetId' => $this->project->id,
                    'activiteId' => $activity2->id,
                    'date' => '2026-01-28',
                    'duree' => 0.5,
                ],
            ],
        ], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'bulkCreateTimeEntries');

        $this->assertCount(2, $data);
        $this->assertEquals(1.0, array_sum(array_column($data, 'duree')));
    }
}
