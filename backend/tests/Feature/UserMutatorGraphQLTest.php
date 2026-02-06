<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class UserMutatorGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;
    private Team $team;

    protected function setUp(): void
    {
        parent::setUp();

        $this->team = Team::factory()->create();
        $this->admin = User::factory()->admin()->create(['equipe_id' => $this->team->id]);
    }

    public function test_admin_peut_creer_un_utilisateur(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateUser($input: CreateUserInput!) {
                createUser(input: $input) {
                    id
                    nom
                    prenom
                    email
                    role
                }
            }
        ', [
            'input' => [
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'email' => 'jean.dupont@test.com',
                'password' => 'motdepasse123',
                'role' => 'UTILISATEUR',
                'equipeId' => (string) $this->team->id,
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createUser');

        $this->assertEquals('Dupont', $data['nom']);
        $this->assertEquals('Jean', $data['prenom']);
        $this->assertEquals('jean.dupont@test.com', $data['email']);

        $this->assertDatabaseHas('users', [
            'email' => 'jean.dupont@test.com',
            'nom' => 'Dupont',
        ]);
    }

    public function test_utilisateur_non_admin_ne_peut_pas_creer(): void
    {
        $user = User::factory()->create();

        $response = $this->graphqlAsUser('
            mutation CreateUser($input: CreateUserInput!) {
                createUser(input: $input) { id }
            }
        ', [
            'input' => [
                'nom' => 'Test',
                'prenom' => 'User',
                'email' => 'test@test.com',
                'password' => 'motdepasse123',
                'role' => 'UTILISATEUR',
            ],
        ], $user);

        $this->assertGraphQLError($response);
    }

    public function test_non_authentifie_ne_peut_pas_creer(): void
    {
        $response = $this->graphql('
            mutation CreateUser($input: CreateUserInput!) {
                createUser(input: $input) { id }
            }
        ', [
            'input' => [
                'nom' => 'Test',
                'prenom' => 'User',
                'email' => 'test@test.com',
                'password' => 'motdepasse123',
                'role' => 'UTILISATEUR',
            ],
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }

    public function test_admin_peut_modifier_un_utilisateur(): void
    {
        $user = User::factory()->create(['nom' => 'Ancien']);

        $response = $this->graphqlAsUser('
            mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
                updateUser(id: $id, input: $input) {
                    id
                    nom
                }
            }
        ', [
            'id' => $user->id,
            'input' => [
                'nom' => 'Nouveau',
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateUser');
        $this->assertEquals('Nouveau', $data['nom']);
    }

    public function test_admin_peut_desactiver_un_utilisateur(): void
    {
        $user = User::factory()->create(['est_actif' => true]);

        $response = $this->graphqlAsUser('
            mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
                updateUser(id: $id, input: $input) {
                    id
                    estActif
                }
            }
        ', [
            'id' => $user->id,
            'input' => [
                'estActif' => false,
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateUser');
        $this->assertFalse($data['estActif']);
    }

    public function test_admin_peut_supprimer_un_utilisateur(): void
    {
        $user = User::factory()->create();

        $response = $this->graphqlAsUser('
            mutation DeleteUser($id: ID!) {
                deleteUser(id: $id)
            }
        ', ['id' => $user->id], $this->admin);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'deleteUser'));
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_admin_ne_peut_pas_se_supprimer_lui_meme(): void
    {
        $response = $this->graphqlAsUser('
            mutation DeleteUser($id: ID!) {
                deleteUser(id: $id)
            }
        ', ['id' => $this->admin->id], $this->admin);

        $this->assertGraphQLError($response);
    }

    public function test_utilisateur_non_admin_ne_peut_pas_supprimer(): void
    {
        $user = User::factory()->create();
        $cible = User::factory()->create();

        $response = $this->graphqlAsUser('
            mutation DeleteUser($id: ID!) {
                deleteUser(id: $id)
            }
        ', ['id' => $cible->id], $user);

        $this->assertGraphQLError($response);
    }
}
