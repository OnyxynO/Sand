<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class ProjectMutatorGraphQLTest extends TestCase
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

    public function test_admin_peut_creer_un_projet(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateProject($input: CreateProjectInput!) {
                createProject(input: $input) {
                    id
                    nom
                    code
                    description
                    estActif
                }
            }
        ', [
            'input' => [
                'nom' => 'Projet Test 2026',
                'code' => 'PRJ2026',
                'description' => 'Description du projet de test',
                'estActif' => true,
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createProject');

        $this->assertEquals('Projet Test 2026', $data['nom']);
        $this->assertEquals('PRJ2026', $data['code']);
        $this->assertEquals('Description du projet de test', $data['description']);
        $this->assertTrue($data['estActif']);

        $this->assertDatabaseHas('projects', [
            'nom' => 'Projet Test 2026',
            'code' => 'PRJ2026',
        ]);
    }

    public function test_utilisateur_ne_peut_pas_creer_projet(): void
    {
        $user = User::factory()->create();

        $response = $this->graphqlAsUser('
            mutation CreateProject($input: CreateProjectInput!) {
                createProject(input: $input) { id }
            }
        ', [
            'input' => [
                'nom' => 'Projet Test',
                'code' => 'TST',
            ],
        ], $user);

        $this->assertGraphQLError($response);
    }

    public function test_non_authentifie_ne_peut_pas_creer_projet(): void
    {
        $response = $this->graphql('
            mutation CreateProject($input: CreateProjectInput!) {
                createProject(input: $input) { id }
            }
        ', [
            'input' => [
                'nom' => 'Projet Test',
                'code' => 'TST',
            ],
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }

    public function test_admin_peut_modifier_un_projet(): void
    {
        $project = Project::factory()->create([
            'nom' => 'Ancien Nom',
            'code' => 'OLD',
        ]);

        $response = $this->graphqlAsUser('
            mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
                updateProject(id: $id, input: $input) {
                    id
                    nom
                    code
                }
            }
        ', [
            'id' => $project->id,
            'input' => [
                'nom' => 'Nouveau Nom 2026',
                'code' => 'NEW2026',
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateProject');

        $this->assertEquals('Nouveau Nom 2026', $data['nom']);
        $this->assertEquals('NEW2026', $data['code']);
    }

    public function test_moderateur_assigne_peut_modifier_projet(): void
    {
        $moderateur = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $project = Project::factory()->create();

        // Assigner le moderateur au projet
        $project->moderateurs()->attach($moderateur->id);

        $response = $this->graphqlAsUser('
            mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
                updateProject(id: $id, input: $input) {
                    id
                    nom
                }
            }
        ', [
            'id' => $project->id,
            'input' => [
                'nom' => 'Modifié par modérateur',
            ],
        ], $moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateProject');

        $this->assertEquals('Modifié par modérateur', $data['nom']);
    }

    public function test_moderateur_non_assigne_ne_peut_pas_modifier(): void
    {
        $moderateur = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $project = Project::factory()->create();

        // Le modérateur n'est PAS assigné au projet

        $response = $this->graphqlAsUser('
            mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
                updateProject(id: $id, input: $input) {
                    id
                    nom
                }
            }
        ', [
            'id' => $project->id,
            'input' => [
                'nom' => 'Tentative de modification',
            ],
        ], $moderateur);

        $this->assertGraphQLError($response);
    }

    public function test_admin_peut_supprimer_un_projet(): void
    {
        $project = Project::factory()->create();

        $response = $this->graphqlAsUser('
            mutation DeleteProject($id: ID!) {
                deleteProject(id: $id)
            }
        ', ['id' => $project->id], $this->admin);

        $this->assertGraphQLSuccess($response);
        $this->assertTrue($this->getGraphQLData($response, 'deleteProject'));
        $this->assertSoftDeleted('projects', ['id' => $project->id]);
    }

    public function test_admin_peut_assigner_moderateur(): void
    {
        $moderateur = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $project = Project::factory()->create();

        $response = $this->graphqlAsUser('
            mutation AddProjectModerator($projetId: ID!, $userId: ID!) {
                addProjectModerator(projetId: $projetId, userId: $userId) {
                    id
                    moderateurs {
                        id
                        nom
                    }
                }
            }
        ', [
            'projetId' => $project->id,
            'userId' => $moderateur->id,
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'addProjectModerator');

        $this->assertCount(1, $data['moderateurs']);
        $this->assertEquals($moderateur->id, $data['moderateurs'][0]['id']);

        // Vérifier en base de données
        $this->assertDatabaseHas('project_moderators', [
            'project_id' => $project->id,
            'user_id' => $moderateur->id,
        ]);
    }

    public function test_admin_peut_definir_activites_projet(): void
    {
        $project = Project::factory()->create();
        $activite1 = Activity::factory()->create(['est_feuille' => true]);
        $activite2 = Activity::factory()->create(['est_feuille' => true]);
        $activite3 = Activity::factory()->create(['est_feuille' => true]);

        $response = $this->graphqlAsUser('
            mutation SetProjectActivities($projetId: ID!, $activiteIds: [ID!]!) {
                setProjectActivities(projetId: $projetId, activiteIds: $activiteIds) {
                    id
                    activitesActives {
                        id
                    }
                }
            }
        ', [
            'projetId' => $project->id,
            'activiteIds' => [$activite1->id, $activite2->id],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'setProjectActivities');

        // Vérifier que les 2 activités sont assignées
        $this->assertCount(2, $data['activitesActives']);

        $activiteIds = array_column($data['activitesActives'], 'id');
        $this->assertContains((string) $activite1->id, $activiteIds);
        $this->assertContains((string) $activite2->id, $activiteIds);
        $this->assertNotContains((string) $activite3->id, $activiteIds);

        // Vérifier en base de données
        $this->assertDatabaseHas('project_activities', [
            'project_id' => $project->id,
            'activity_id' => $activite1->id,
        ]);
        $this->assertDatabaseHas('project_activities', [
            'project_id' => $project->id,
            'activity_id' => $activite2->id,
        ]);
        $this->assertDatabaseMissing('project_activities', [
            'project_id' => $project->id,
            'activity_id' => $activite3->id,
        ]);
    }

    public function test_admin_peut_ajouter_utilisateur(): void
    {
        $user = User::factory()->create(['equipe_id' => $this->team->id]);
        $project = Project::factory()->create();

        $response = $this->graphqlAsUser('
            mutation AddProjectUser($projetId: ID!, $userId: ID!) {
                addProjectUser(projetId: $projetId, userId: $userId) {
                    id
                    utilisateurs {
                        id
                        nom
                    }
                }
            }
        ', [
            'projetId' => $project->id,
            'userId' => $user->id,
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'addProjectUser');

        $this->assertCount(1, $data['utilisateurs']);
        $this->assertEquals($user->id, $data['utilisateurs'][0]['id']);

        // Vérifier en base de données
        $this->assertDatabaseHas('project_user', [
            'project_id' => $project->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_moderateur_assigne_peut_ajouter_utilisateur(): void
    {
        $moderateur = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $user = User::factory()->create(['equipe_id' => $this->team->id]);
        $project = Project::factory()->create();

        // Assigner le modérateur au projet
        $project->moderateurs()->attach($moderateur->id);

        $response = $this->graphqlAsUser('
            mutation AddProjectUser($projetId: ID!, $userId: ID!) {
                addProjectUser(projetId: $projetId, userId: $userId) {
                    id
                    utilisateurs {
                        id
                    }
                }
            }
        ', [
            'projetId' => $project->id,
            'userId' => $user->id,
        ], $moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'addProjectUser');

        $this->assertCount(1, $data['utilisateurs']);
        $this->assertEquals($user->id, $data['utilisateurs'][0]['id']);
    }

    public function test_admin_peut_restaurer_projet_supprime(): void
    {
        $project = Project::factory()->create();
        $project->delete();

        $this->assertSoftDeleted('projects', ['id' => $project->id]);

        $response = $this->graphqlAsUser('
            mutation RestoreProject($id: ID!) {
                restoreProject(id: $id) {
                    id
                    nom
                }
            }
        ', ['id' => $project->id], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'restoreProject');

        $this->assertEquals($project->id, $data['id']);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'deleted_at' => null,
        ]);
    }

    public function test_moderateur_assigne_peut_retirer_utilisateur(): void
    {
        $moderateur = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $user = User::factory()->create(['equipe_id' => $this->team->id]);
        $project = Project::factory()->create();

        // Assigner le modérateur et l'utilisateur au projet
        $project->moderateurs()->attach($moderateur->id);
        $project->utilisateurs()->attach($user->id);

        $response = $this->graphqlAsUser('
            mutation RemoveProjectUser($projetId: ID!, $userId: ID!) {
                removeProjectUser(projetId: $projetId, userId: $userId) {
                    id
                    utilisateurs {
                        id
                    }
                }
            }
        ', [
            'projetId' => $project->id,
            'userId' => $user->id,
        ], $moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'removeProjectUser');

        $this->assertCount(0, $data['utilisateurs']);

        // Vérifier en base de données
        $this->assertDatabaseMissing('project_user', [
            'project_id' => $project->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_admin_peut_retirer_moderateur(): void
    {
        $moderateur = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $project = Project::factory()->create();

        // Assigner le modérateur
        $project->moderateurs()->attach($moderateur->id);

        $response = $this->graphqlAsUser('
            mutation RemoveProjectModerator($projetId: ID!, $userId: ID!) {
                removeProjectModerator(projetId: $projetId, userId: $userId) {
                    id
                    moderateurs {
                        id
                    }
                }
            }
        ', [
            'projetId' => $project->id,
            'userId' => $moderateur->id,
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'removeProjectModerator');

        $this->assertCount(0, $data['moderateurs']);

        // Vérifier en base de données
        $this->assertDatabaseMissing('project_moderators', [
            'project_id' => $project->id,
            'user_id' => $moderateur->id,
        ]);
    }

    public function test_creation_projet_avec_dates(): void
    {
        $response = $this->graphqlAsUser('
            mutation CreateProject($input: CreateProjectInput!) {
                createProject(input: $input) {
                    id
                    nom
                    dateDebut
                    dateFin
                }
            }
        ', [
            'input' => [
                'nom' => 'Projet 2026',
                'code' => 'P2026',
                'dateDebut' => '2026-01-01',
                'dateFin' => '2026-12-31',
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'createProject');

        $this->assertEquals('2026-01-01', $data['dateDebut']);
        $this->assertEquals('2026-12-31', $data['dateFin']);
    }

    public function test_utilisateur_ne_peut_pas_supprimer_projet(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create();

        $response = $this->graphqlAsUser('
            mutation DeleteProject($id: ID!) {
                deleteProject(id: $id)
            }
        ', ['id' => $project->id], $user);

        $this->assertGraphQLError($response);
    }

    public function test_moderateur_ne_peut_pas_assigner_moderateur(): void
    {
        $moderateur = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $autreModerator = User::factory()->moderateur()->create(['equipe_id' => $this->team->id]);
        $project = Project::factory()->create();

        // Assigner le premier modérateur
        $project->moderateurs()->attach($moderateur->id);

        // Le modérateur essaie d'assigner un autre modérateur (seul admin peut)
        $response = $this->graphqlAsUser('
            mutation AddProjectModerator($projetId: ID!, $userId: ID!) {
                addProjectModerator(projetId: $projetId, userId: $userId) {
                    id
                }
            }
        ', [
            'projetId' => $project->id,
            'userId' => $autreModerator->id,
        ], $moderateur);

        $this->assertGraphQLError($response);
    }
}
