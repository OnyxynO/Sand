<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class TeamMutatorGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $team = Team::factory()->create();
        $this->admin = User::factory()->admin()->create(['equipe_id' => $team->id]);
    }

    public function test_admin_peut_creer_une_equipe(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateTeam($input: TeamInput!) {
                createTeam(input: $input) {
                    id
                    nom
                    code
                    description
                }
            }
        ', [
            'input' => [
                'nom' => 'Nouvelle Equipe',
                'code' => 'NEQ',
                'description' => 'Description test',
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createTeam');

        $this->assertEquals('Nouvelle Equipe', $data['nom']);
        $this->assertEquals('NEQ', $data['code']);

        $this->assertDatabaseHas('teams', ['code' => 'NEQ']);
    }

    public function test_utilisateur_non_admin_ne_peut_pas_creer(): void
    {
        $user = User::factory()->create();

        $response = $this->graphqlAsUser('
            mutation CreateTeam($input: TeamInput!) {
                createTeam(input: $input) { id }
            }
        ', [
            'input' => [
                'nom' => 'Test',
                'code' => 'TST',
            ],
        ], $user);

        $this->assertGraphQLError($response);
    }

    public function test_admin_peut_modifier_une_equipe(): void
    {
        $team = Team::factory()->create(['nom' => 'Ancien Nom']);

        $response = $this->graphqlAsUser('
            mutation UpdateTeam($id: ID!, $input: TeamInput!) {
                updateTeam(id: $id, input: $input) {
                    id
                    nom
                }
            }
        ', [
            'id' => $team->id,
            'input' => [
                'nom' => 'Nouveau Nom',
                'code' => $team->code,
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateTeam');
        $this->assertEquals('Nouveau Nom', $data['nom']);
    }

    public function test_admin_peut_supprimer_une_equipe(): void
    {
        $team = Team::factory()->create();

        $response = $this->graphqlAsUser('
            mutation DeleteTeam($id: ID!) {
                deleteTeam(id: $id)
            }
        ', ['id' => (string) $team->id], $this->admin);

        $this->assertGraphQLSuccess($response);
    }

    public function test_non_authentifie_ne_peut_pas_creer(): void
    {
        $response = $this->graphql('
            mutation CreateTeam($input: TeamInput!) {
                createTeam(input: $input) { id }
            }
        ', [
            'input' => [
                'nom' => 'Test',
                'code' => 'TST',
            ],
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }
}
