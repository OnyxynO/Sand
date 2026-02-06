<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Export;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use App\Jobs\ExportTimeEntriesJob;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class ExportMutatorGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;
    private User $moderateur;
    private User $utilisateur;

    private string $mutation = '
        mutation RequestExport($input: ExportInput!) {
            requestExport(input: $input) {
                id
                statut
                urlTelechargement
                expireLe
            }
        }
    ';

    protected function setUp(): void
    {
        parent::setUp();

        $team = Team::factory()->create();
        $this->admin = User::factory()->admin()->create(['equipe_id' => $team->id]);
        $this->moderateur = User::factory()->moderateur()->create(['equipe_id' => $team->id]);
        $this->utilisateur = User::factory()->create(['equipe_id' => $team->id]);
    }

    public function test_admin_peut_demander_export(): void
    {
        Queue::fake();

        $response = $this->graphqlAsUser($this->mutation, [
            'input' => [
                'format' => 'CSV',
                'dateDebut' => '2026-01-01',
                'dateFin' => '2026-01-31',
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'requestExport');

        $this->assertNotEmpty($data['id']);
        $this->assertEquals('EN_ATTENTE', $data['statut']);
        $this->assertNull($data['urlTelechargement']);

        // Verifier que l'export est en base
        $this->assertDatabaseHas('exports', [
            'id' => $data['id'],
            'user_id' => $this->admin->id,
            'statut' => 'en_attente',
        ]);

        Queue::assertPushed(ExportTimeEntriesJob::class);
    }

    public function test_moderateur_peut_demander_export(): void
    {
        Queue::fake();

        $response = $this->graphqlAsUser($this->mutation, [
            'input' => [
                'format' => 'CSV',
                'dateDebut' => '2026-01-01',
                'dateFin' => '2026-01-31',
            ],
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        Queue::assertPushed(ExportTimeEntriesJob::class);
    }

    public function test_utilisateur_ne_peut_pas_demander_export(): void
    {
        Queue::fake();

        $response = $this->graphqlAsUser($this->mutation, [
            'input' => [
                'format' => 'CSV',
                'dateDebut' => '2026-01-01',
                'dateFin' => '2026-01-31',
            ],
        ], $this->utilisateur);

        $this->assertGraphQLError($response);
        Queue::assertNothingPushed();
    }

    public function test_non_authentifie_ne_peut_pas_demander_export(): void
    {
        $response = $this->graphql($this->mutation, [
            'input' => [
                'format' => 'CSV',
                'dateDebut' => '2026-01-01',
                'dateFin' => '2026-01-31',
            ],
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }

    public function test_export_avec_filtres_projet_et_equipe(): void
    {
        Queue::fake();

        $response = $this->graphqlAsUser($this->mutation, [
            'input' => [
                'format' => 'CSV',
                'dateDebut' => '2026-01-01',
                'dateFin' => '2026-01-31',
                'projetId' => '1',
                'equipeId' => '2',
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'requestExport');

        // Verifier que les filtres sont stockes
        $export = Export::find($data['id']);
        $this->assertEquals('1', $export->filtres['project_id']);
        $this->assertEquals('2', $export->filtres['team_id']);
    }

    public function test_validation_dates_requises(): void
    {
        $response = $this->graphqlAsUser($this->mutation, [
            'input' => [
                'format' => 'CSV',
                'dateDebut' => '',
                'dateFin' => '',
            ],
        ], $this->admin);

        $this->assertGraphQLError($response);
    }
}
