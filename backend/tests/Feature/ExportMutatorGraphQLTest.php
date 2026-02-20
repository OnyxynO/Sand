<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Export;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
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

    // ─── mesExports ────────────────────────────────────────────────────────────

    public function test_mes_exports_retourne_les_exports_de_utilisateur(): void
    {
        Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_TERMINE,
            'format' => 'CSV',
            'filtres' => ['date_debut' => '2026-01-01', 'date_fin' => '2026-01-31'],
        ]);

        Export::create([
            'user_id' => $this->moderateur->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
        ]);

        $query = '
            query {
                mesExports {
                    id
                    statut
                    filtres
                    creeLe
                }
            }
        ';

        $response = $this->graphqlAsUser($query, [], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'mesExports');

        // Seul l'export de l'admin est retourne
        $this->assertCount(1, $data);
        $this->assertEquals('TERMINE', $data[0]['statut']);
    }

    public function test_mes_exports_retourne_liste_vide_si_aucun_export(): void
    {
        $query = '
            query {
                mesExports {
                    id
                    statut
                }
            }
        ';

        $response = $this->graphqlAsUser($query, [], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'mesExports');
        $this->assertEmpty($data);
    }

    // ─── desactiverExport ──────────────────────────────────────────────────────

    public function test_desactiver_export_marque_desactive_et_supprime_fichier(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('exports/test/fichier.csv', 'contenu');

        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_TERMINE,
            'format' => 'CSV',
            'chemin_fichier' => 'exports/test/fichier.csv',
            'nom_fichier' => 'fichier.csv',
            'expire_le' => now()->addHours(24),
        ]);

        $mutationDesactiver = '
            mutation DesactiverExport($id: ID!) {
                desactiverExport(id: $id) {
                    id
                    statut
                }
            }
        ';

        $response = $this->graphqlAsUser($mutationDesactiver, ['id' => $export->id], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'desactiverExport');
        $this->assertEquals('DESACTIVE', $data['statut']);

        // Verifier en base
        $fresh = $export->fresh();
        $this->assertEquals(Export::STATUT_DESACTIVE, $fresh->statut);
        $this->assertNull($fresh->chemin_fichier);

        // Verifier que le fichier est supprime
        Storage::disk('local')->assertMissing('exports/test/fichier.csv');
    }

    public function test_desactiver_export_interdit_pour_autre_utilisateur(): void
    {
        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_TERMINE,
            'format' => 'CSV',
        ]);

        $mutationDesactiver = '
            mutation DesactiverExport($id: ID!) {
                desactiverExport(id: $id) {
                    id
                    statut
                }
            }
        ';

        $response = $this->graphqlAsUser($mutationDesactiver, ['id' => $export->id], $this->moderateur);

        $this->assertGraphQLError($response);
    }

    // ─── supprimerExport ───────────────────────────────────────────────────────

    public function test_supprimer_export_supprime_la_ligne_en_base(): void
    {
        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_ECHEC,
            'format' => 'CSV',
        ]);

        $mutationSupprimer = '
            mutation SupprimerExport($id: ID!) {
                supprimerExport(id: $id)
            }
        ';

        $response = $this->graphqlAsUser($mutationSupprimer, ['id' => $export->id], $this->admin);

        $this->assertGraphQLSuccess($response);
        $this->assertDatabaseMissing('exports', ['id' => $export->id]);
    }

    public function test_supprimer_export_interdit_pour_autre_utilisateur(): void
    {
        $export = Export::create([
            'user_id' => $this->admin->id,
            'statut' => Export::STATUT_ECHEC,
            'format' => 'CSV',
        ]);

        $mutationSupprimer = '
            mutation SupprimerExport($id: ID!) {
                supprimerExport(id: $id)
            }
        ';

        $response = $this->graphqlAsUser($mutationSupprimer, ['id' => $export->id], $this->moderateur);

        $this->assertGraphQLError($response);
        $this->assertDatabaseHas('exports', ['id' => $export->id]);
    }
}
