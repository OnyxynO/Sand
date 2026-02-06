<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Export;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportModelTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_creation_genere_uuid(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
        ]);

        $this->assertNotEmpty($export->id);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/',
            $export->id,
        );
    }

    public function test_statut_initial_en_attente(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
        ]);

        $this->assertEquals(Export::STATUT_EN_ATTENTE, $export->fresh()->statut);
    }

    public function test_marquer_en_cours(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
        ]);

        $export->marquerEnCours();

        $this->assertEquals(Export::STATUT_EN_COURS, $export->fresh()->statut);
    }

    public function test_marquer_termine(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_EN_COURS,
            'format' => 'CSV',
        ]);

        $export->marquerTermine('exports/test.csv', 'export_test.csv');

        $fresh = $export->fresh();
        $this->assertEquals(Export::STATUT_TERMINE, $fresh->statut);
        $this->assertEquals('exports/test.csv', $fresh->chemin_fichier);
        $this->assertEquals('export_test.csv', $fresh->nom_fichier);
        $this->assertNotNull($fresh->expire_le);
        // Expire dans ~24h
        $this->assertTrue($fresh->expire_le->isFuture());
    }

    public function test_marquer_echec(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_EN_COURS,
            'format' => 'CSV',
        ]);

        $export->marquerEchec('Erreur de test');

        $fresh = $export->fresh();
        $this->assertEquals(Export::STATUT_ECHEC, $fresh->statut);
        $this->assertEquals('Erreur de test', $fresh->erreur);
    }

    public function test_est_expire_retourne_true_si_expire(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_TERMINE,
            'format' => 'CSV',
            'expire_le' => now()->subHour(),
        ]);

        $this->assertTrue($export->estExpire());
    }

    public function test_est_expire_retourne_false_si_pas_expire(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_TERMINE,
            'format' => 'CSV',
            'expire_le' => now()->addHours(24),
        ]);

        $this->assertFalse($export->estExpire());
    }

    public function test_est_termine(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_TERMINE,
            'format' => 'CSV',
        ]);

        $this->assertTrue($export->estTermine());
    }

    public function test_est_termine_faux_si_en_cours(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_EN_COURS,
            'format' => 'CSV',
        ]);

        $this->assertFalse($export->estTermine());
    }

    public function test_statut_graphql_mapping(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'format' => 'CSV',
        ]);

        $export->statut = Export::STATUT_EN_ATTENTE;
        $this->assertEquals('EN_ATTENTE', $export->statutGraphQL());

        $export->statut = Export::STATUT_EN_COURS;
        $this->assertEquals('EN_COURS', $export->statutGraphQL());

        $export->statut = Export::STATUT_TERMINE;
        $this->assertEquals('TERMINE', $export->statutGraphQL());

        $export->statut = Export::STATUT_ECHEC;
        $this->assertEquals('ECHEC', $export->statutGraphQL());
    }

    public function test_relation_utilisateur(): void
    {
        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
        ]);

        $this->assertEquals($this->user->id, $export->utilisateur->id);
    }

    public function test_filtres_cast_en_array(): void
    {
        $filtres = ['date_debut' => '2026-01-01', 'date_fin' => '2026-01-31'];

        $export = Export::create([
            'user_id' => $this->user->id,
            'statut' => Export::STATUT_EN_ATTENTE,
            'format' => 'CSV',
            'filtres' => $filtres,
        ]);

        $fresh = $export->fresh();
        $this->assertIsArray($fresh->filtres);
        $this->assertEquals('2026-01-01', $fresh->filtres['date_debut']);
    }
}
