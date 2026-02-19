<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Team;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

/**
 * Tests GraphQL pour la query anomalies — A-G03, A-G04
 */
class SupervisionTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;
    private User $moderateur;
    private User $utilisateur;
    private User $userEquipeA;
    private User $userEquipeB;
    private Team $equipeA;
    private Team $equipeB;
    private Activity $activite;

    protected function setUp(): void
    {
        parent::setUp();

        $this->equipeA = Team::factory()->create(['nom' => 'Equipe A']);
        $this->equipeB = Team::factory()->create(['nom' => 'Equipe B']);

        $this->admin       = User::factory()->admin()->create();
        $this->moderateur  = User::factory()->moderateur()->create(['equipe_id' => $this->equipeA->id]);
        $this->utilisateur = User::factory()->create(['equipe_id' => $this->equipeA->id]);
        $this->userEquipeA = User::factory()->create(['equipe_id' => $this->equipeA->id]);
        $this->userEquipeB = User::factory()->create(['equipe_id' => $this->equipeB->id]);

        $this->activite = Activity::factory()->create();

        // Saisie incomplete : lundi 12 jan 2026, 0.5 ETP (attendu 1.0) → JOUR_INCOMPLET
        TimeEntry::factory()->create([
            'user_id'     => $this->userEquipeA->id,
            'activity_id' => $this->activite->id,
            'date'        => '2026-01-12',
            'duree'       => 0.5,
        ]);

        TimeEntry::factory()->create([
            'user_id'     => $this->userEquipeB->id,
            'activity_id' => $this->activite->id,
            'date'        => '2026-01-12',
            'duree'       => 0.5,
        ]);
    }

    // ─── A-G03 : ADMIN voit les anomalies de tous les utilisateurs ───

    public function test_admin_voit_anomalies_de_tous_les_utilisateurs(): void
    {
        $response = $this->graphqlAsUser('
            query Anomalies($dateDebut: Date!, $dateFin: Date!, $types: [AnomalyType!]) {
                anomalies(dateDebut: $dateDebut, dateFin: $dateFin, types: $types) {
                    id
                    type
                    utilisateur { id }
                }
            }
        ', [
            'dateDebut' => '2026-01-12',
            'dateFin'   => '2026-01-12',
            'types'     => ['JOUR_INCOMPLET'],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'anomalies');

        // Les 2 utilisateurs avec saisie incomplete doivent apparaitre
        $this->assertCount(2, $data);

        $userIds = array_column(array_column($data, 'utilisateur'), 'id');
        $this->assertContains((string) $this->userEquipeA->id, $userIds);
        $this->assertContains((string) $this->userEquipeB->id, $userIds);
    }

    // ─── A-G04 : MODERATEUR peut acceder, filtre par equipe ──────────

    public function test_moderateur_peut_acceder_a_la_query_anomalies(): void
    {
        $response = $this->graphqlAsUser('
            query Anomalies($dateDebut: Date!, $dateFin: Date!, $equipeId: ID, $types: [AnomalyType!]) {
                anomalies(dateDebut: $dateDebut, dateFin: $dateFin, equipeId: $equipeId, types: $types) {
                    id
                    type
                    utilisateur { id }
                }
            }
        ', [
            'dateDebut' => '2026-01-12',
            'dateFin'   => '2026-01-12',
            'equipeId'  => (string) $this->equipeA->id,
            'types'     => ['JOUR_INCOMPLET'],
        ], $this->moderateur);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'anomalies');

        // Filtre par equipeA : seul userEquipeA a une saisie incomplete
        $this->assertCount(1, $data);
        $this->assertEquals((string) $this->userEquipeA->id, $data[0]['utilisateur']['id']);
    }

    // ─── Acces refuse pour utilisateur simple ────────────────────────

    public function test_utilisateur_ne_peut_pas_acceder_aux_anomalies(): void
    {
        $response = $this->graphqlAsUser('
            query Anomalies($dateDebut: Date!, $dateFin: Date!) {
                anomalies(dateDebut: $dateDebut, dateFin: $dateFin) {
                    id
                }
            }
        ', [
            'dateDebut' => '2026-01-12',
            'dateFin'   => '2026-01-12',
        ], $this->utilisateur);

        $this->assertGraphQLError($response);
    }
}
