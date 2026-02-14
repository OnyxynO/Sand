<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class SettingMutatorGraphQLTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $team = Team::factory()->create();
        $this->admin = User::factory()->admin()->create(['equipe_id' => $team->id]);

        // Creer des parametres de test
        Setting::create([
            'cle' => 'jours_retroactifs',
            'valeur' => 30,
            'description' => 'Nombre de jours retroactifs autorises',
        ]);
        Setting::create([
            'cle' => 'rappel_saisie_actif',
            'valeur' => true,
            'description' => 'Activer les rappels de saisie',
        ]);
    }

    public function test_admin_peut_modifier_un_parametre(): void
    {
        $response = $this->graphqlAsUser('
            mutation UpdateSetting($cle: String!, $valeur: JSON!) {
                updateSetting(cle: $cle, valeur: $valeur) {
                    cle
                    valeur
                }
            }
        ', [
            'cle' => 'jours_retroactifs',
            'valeur' => '60',
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateSetting');

        $this->assertEquals('jours_retroactifs', $data['cle']);
        $this->assertEquals('60', $data['valeur']);
    }

    public function test_utilisateur_non_admin_ne_peut_pas_modifier(): void
    {
        $user = User::factory()->create();

        $response = $this->graphqlAsUser('
            mutation UpdateSetting($cle: String!, $valeur: JSON!) {
                updateSetting(cle: $cle, valeur: $valeur) { cle }
            }
        ', [
            'cle' => 'jours_retroactifs',
            'valeur' => '60',
        ], $user);

        $this->assertGraphQLError($response);
    }

    public function test_non_authentifie_ne_peut_pas_modifier(): void
    {
        $response = $this->graphql('
            mutation UpdateSetting($cle: String!, $valeur: JSON!) {
                updateSetting(cle: $cle, valeur: $valeur) { cle }
            }
        ', [
            'cle' => 'jours_retroactifs',
            'valeur' => '60',
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }

    public function test_admin_peut_reinitialiser_les_parametres(): void
    {
        // Modifier un parametre
        Setting::where('cle', 'jours_retroactifs')->update(['valeur' => 99]);

        $response = $this->graphqlAsUser('
            mutation ResetSettings {
                resetSettings {
                    cle
                    valeur
                }
            }
        ', [], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'resetSettings');

        // Verifier que les valeurs par defaut sont restaurees
        $joursRetro = collect($data)->firstWhere('cle', 'jours_retroactifs');
        $this->assertEquals(7, $joursRetro['valeur']);
    }

    public function test_utilisateur_non_admin_ne_peut_pas_reinitialiser(): void
    {
        $user = User::factory()->create();

        $response = $this->graphqlAsUser('
            mutation ResetSettings {
                resetSettings { cle }
            }
        ', [], $user);

        $this->assertGraphQLError($response);
    }

    public function test_modifier_parametre_inexistant_echoue(): void
    {
        $response = $this->graphqlAsUser('
            mutation UpdateSetting($cle: String!, $valeur: JSON!) {
                updateSetting(cle: $cle, valeur: $valeur) { cle }
            }
        ', [
            'cle' => 'parametre_inexistant',
            'valeur' => 'test',
        ], $this->admin);

        $this->assertGraphQLError($response);
    }
}
