<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Exceptions\RhApiException;
use App\Services\RhApiClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RhApiClientTest extends TestCase
{
    private RhApiClient $client;

    protected function setUp(): void
    {
        parent::setUp();

        // Configurer l'URL et la cle API pour les tests
        config([
            'services.rh_api.url' => 'https://rh-api.test/api',
            'services.rh_api.key' => 'test-api-key',
            'services.rh_api.timeout' => 5,
        ]);

        $this->client = new RhApiClient();
    }

    // --- getAbsences ---

    public function test_get_absences_retourne_les_donnees(): void
    {
        Http::fake([
            'rh-api.test/api/absences*' => Http::response([
                'data' => [
                    [
                        'type' => 'conge',
                        'date_debut' => '2026-01-06',
                        'date_fin' => '2026-01-10',
                        'duree_journaliere' => 1.0,
                    ],
                    [
                        'type' => 'rtt',
                        'date_debut' => '2026-01-13',
                        'date_fin' => '2026-01-13',
                        'duree_journaliere' => 1.0,
                    ],
                ],
            ]),
        ]);

        $absences = $this->client->getAbsences('USR001', '2026-01-01', '2026-01-31');

        $this->assertCount(2, $absences);
        $this->assertEquals('conge', $absences[0]['type']);
        $this->assertEquals('rtt', $absences[1]['type']);

        // Verifier que les bons parametres ont ete envoyes
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/absences')
                && $request['matricule'] === 'USR001'
                && $request['date_debut'] === '2026-01-01'
                && $request['date_fin'] === '2026-01-31';
        });
    }

    public function test_get_absences_retourne_tableau_vide_si_pas_de_data(): void
    {
        Http::fake([
            'rh-api.test/api/absences*' => Http::response(['message' => 'ok']),
        ]);

        $absences = $this->client->getAbsences('USR001', '2026-01-01', '2026-01-31');

        $this->assertCount(0, $absences);
    }

    public function test_get_absences_envoie_header_authorization(): void
    {
        Http::fake([
            'rh-api.test/api/absences*' => Http::response(['data' => []]),
        ]);

        $this->client->getAbsences('USR001', '2026-01-01', '2026-01-31');

        Http::assertSent(function ($request) {
            return $request->hasHeader('Authorization', 'Bearer test-api-key');
        });
    }

    public function test_get_absences_erreur_http_lance_exception(): void
    {
        Http::fake([
            'rh-api.test/api/absences*' => Http::response(
                ['error' => 'Utilisateur introuvable'],
                404
            ),
        ]);

        $this->expectException(RhApiException::class);
        $this->expectExceptionMessageMatches('/erreur HTTP 404/');

        $this->client->getAbsences('INCONNU', '2026-01-01', '2026-01-31');
    }

    public function test_get_absences_erreur_500_lance_exception(): void
    {
        Http::fake([
            'rh-api.test/api/absences*' => Http::response(null, 500),
        ]);

        $this->expectException(RhApiException::class);
        $this->expectExceptionMessageMatches('/erreur HTTP 500/');

        $this->client->getAbsences('USR001', '2026-01-01', '2026-01-31');
    }

    public function test_get_absences_timeout_lance_exception(): void
    {
        Http::fake([
            'rh-api.test/api/absences*' => function () {
                throw new ConnectionException('Connection timed out');
            },
        ]);

        $this->expectException(RhApiException::class);
        $this->expectExceptionMessageMatches('/connecter/');

        $this->client->getAbsences('USR001', '2026-01-01', '2026-01-31');
    }

    // --- healthCheck ---

    public function test_health_check_retourne_true_si_ok(): void
    {
        Http::fake([
            'rh-api.test/api/health*' => Http::response(['status' => 'ok']),
        ]);

        $this->assertTrue($this->client->healthCheck());
    }

    public function test_health_check_retourne_false_si_erreur(): void
    {
        Http::fake([
            'rh-api.test/api/health*' => Http::response(null, 503),
        ]);

        $this->assertFalse($this->client->healthCheck());
    }

    public function test_health_check_retourne_false_si_connexion_impossible(): void
    {
        Http::fake([
            'rh-api.test/api/health*' => function () {
                throw new ConnectionException('Connection refused');
            },
        ]);

        $this->assertFalse($this->client->healthCheck());
    }

    public function test_health_check_retourne_false_si_status_invalide(): void
    {
        Http::fake([
            'rh-api.test/api/health*' => Http::response(['status' => 'degraded']),
        ]);

        $this->assertFalse($this->client->healthCheck());
    }

    // --- Sans cle API ---

    public function test_pas_de_header_authorization_sans_cle_api(): void
    {
        config(['services.rh_api.key' => '']);
        $client = new RhApiClient();

        Http::fake([
            'rh-api.test/api/absences*' => Http::response(['data' => []]),
        ]);

        $client->getAbsences('USR001', '2026-01-01', '2026-01-31');

        Http::assertSent(function ($request) {
            return ! $request->hasHeader('Authorization');
        });
    }
}
