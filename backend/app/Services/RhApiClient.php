<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\RhApiException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Client HTTP pour l'API RH externe (absences des collaborateurs).
 */
class RhApiClient
{
    protected string $baseUrl;

    protected string $apiKey;

    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.rh_api.url'), '/');
        $this->apiKey = config('services.rh_api.key');
        $this->timeout = (int) config('services.rh_api.timeout', 30);
    }

    /**
     * Recuperer les absences d'un collaborateur pour une periode donnee.
     *
     * @param  string  $matricule  Matricule du collaborateur
     * @param  string  $dateDebut  Date de debut (Y-m-d)
     * @param  string  $dateFin  Date de fin (Y-m-d)
     * @return array Liste des absences
     *
     * @throws RhApiException
     */
    public function getAbsences(string $matricule, string $dateDebut, string $dateFin): array
    {
        $params = [
            'matricule' => $matricule,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
        ];

        $response = $this->get('/absences', $params);

        return $response['data'] ?? [];
    }

    /**
     * Verifier la disponibilite de l'API RH.
     *
     * @return bool true si l'API est disponible
     */
    public function healthCheck(): bool
    {
        try {
            $response = $this->get('/health');

            return isset($response['status']) && $response['status'] === 'ok';
        } catch (RhApiException $e) {
            Log::warning('API RH indisponible', ['erreur' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Effectuer une requete GET vers l'API RH.
     *
     * @param  string  $endpoint  Chemin de l'API (sans le baseUrl)
     * @param  array  $params  Parametres de requete
     * @return array Reponse JSON decodee
     *
     * @throws RhApiException
     */
    protected function get(string $endpoint, array $params = []): array
    {
        $url = $this->baseUrl.$endpoint;

        Log::debug('Appel API RH', [
            'url' => $url,
            'params' => $params,
        ]);

        try {
            $request = Http::timeout($this->timeout);

            // Ajouter la cle API si configuree
            if ($this->apiKey) {
                $request = $request->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                ]);
            }

            $response = $request->get($url, $params);

            if ($response->failed()) {
                throw RhApiException::erreurHttp(
                    $response->status(),
                    $response->json()
                );
            }

            $data = $response->json();

            if ($data === null) {
                throw RhApiException::reponseInvalide('JSON attendu');
            }

            return $data;

        } catch (RhApiException $e) {
            throw $e;
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Erreur connexion API RH', [
                'url' => $url,
                'erreur' => $e->getMessage(),
            ]);
            throw RhApiException::connexionEchouee($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Erreur inattendue API RH', [
                'url' => $url,
                'erreur' => $e->getMessage(),
            ]);
            throw RhApiException::connexionEchouee($e->getMessage());
        }
    }
}
