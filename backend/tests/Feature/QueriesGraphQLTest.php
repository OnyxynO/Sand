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

class QueriesGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $team = Team::factory()->create();
        $this->user = User::factory()->create(['equipe_id' => $team->id]);
    }

    public function test_lister_les_equipes(): void
    {
        Team::factory()->count(3)->create();

        $response = $this->graphqlAsUser('
            { equipes { id nom code } }
        ', [], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'equipes');

        // 4 equipes: 3 creees + 1 de l'utilisateur
        $this->assertCount(4, $data);
    }

    public function test_equipes_necessite_authentification(): void
    {
        $response = $this->graphql('{ equipes { id } }');

        $this->assertGraphQLUnauthenticated($response);
    }

    public function test_lister_les_projets(): void
    {
        Project::factory()->count(3)->create();

        $response = $this->graphqlAsUser('
            { projets { id nom code estActif } }
        ', [], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'projets');

        $this->assertCount(3, $data);
    }

    public function test_filtrer_projets_actifs(): void
    {
        Project::factory()->count(2)->create(['est_actif' => true]);
        Project::factory()->count(1)->create(['est_actif' => false]);

        $response = $this->graphqlAsUser('
            { projets(actif: true) { id estActif } }
        ', [], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'projets');

        $this->assertCount(2, $data);
        $this->assertTrue($data[0]['estActif']);
    }

    public function test_obtenir_un_projet_par_id(): void
    {
        $project = Project::factory()->create(['nom' => 'Mon Projet']);

        $response = $this->graphqlAsUser('
            query GetProjet($id: ID!) {
                projet(id: $id) {
                    id
                    nom
                }
            }
        ', ['id' => $project->id], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'projet');

        $this->assertEquals('Mon Projet', $data['nom']);
    }

    public function test_lister_arbre_activites(): void
    {
        // Activites racines
        Activity::factory()->count(2)->create([
            'parent_id' => null,
            'niveau' => 0,
        ]);

        $response = $this->graphqlAsUser('
            { arbreActivites { id nom niveau estFeuille } }
        ', [], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'arbreActivites');

        $this->assertCount(2, $data);
    }

    public function test_statistiques(): void
    {
        $project = Project::factory()->create();
        $activity = Activity::factory()->create();

        TimeEntry::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'activity_id' => $activity->id,
            'date' => '2026-01-15',
            'duree' => 0.5,
        ]);

        TimeEntry::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'activity_id' => $activity->id,
            'date' => '2026-01-16',
            'duree' => 0.5,
        ]);

        $response = $this->graphqlAsUser('
            {
                statistiques(dateDebut: "2026-01-01", dateFin: "2026-01-31") {
                    tempsTotal
                    parProjet { tempsTotal }
                    parJour { date tempsTotal }
                }
            }
        ', [], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'statistiques');

        $this->assertEquals(1.0, $data['tempsTotal']);
        $this->assertCount(1, $data['parProjet']);
        $this->assertCount(2, $data['parJour']);
    }

    public function test_utilisateurs_pagines(): void
    {
        User::factory()->count(25)->create();

        $response = $this->graphqlAsUser('
            {
                users(first: 10) {
                    data { id nom }
                    paginatorInfo { total currentPage lastPage }
                }
            }
        ', [], $this->user);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'users');

        $this->assertCount(10, $data['data']);
        $this->assertEquals(26, $data['paginatorInfo']['total']); // 25 + 1 (user actuel)
    }
}
