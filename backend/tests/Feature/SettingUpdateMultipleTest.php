<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\GraphQLTestTrait;

class SettingUpdateMultipleTest extends TestCase
{
    use RefreshDatabase;
    use GraphQLTestTrait;

    private User $admin;
    private User $utilisateur;

    private string $mutation = '
        mutation UpdateSettings($settings: [SettingInput!]!) {
            updateSettings(settings: $settings) {
                cle
                valeur
            }
        }
    ';

    protected function setUp(): void
    {
        parent::setUp();

        $team = Team::factory()->create();
        $this->admin = User::factory()->admin()->create(['equipe_id' => $team->id]);
        $this->utilisateur = User::factory()->create(['equipe_id' => $team->id]);

        Setting::create(['cle' => 'delai_annulation', 'valeur' => 5, 'description' => 'Delai']);
        Setting::create(['cle' => 'afficher_weekends', 'valeur' => false, 'description' => 'Weekends']);
        Setting::create(['cle' => 'premier_jour_semaine', 'valeur' => 1, 'description' => 'Premier jour']);
    }

    public function test_admin_peut_modifier_plusieurs_parametres(): void
    {
        $response = $this->graphqlAsUser($this->mutation, [
            'settings' => [
                ['cle' => 'delai_annulation', 'valeur' => '10'],
                ['cle' => 'afficher_weekends', 'valeur' => 'true'],
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateSettings');

        $this->assertCount(2, $data);

        // Verifier en base
        $this->assertEquals('10', Setting::where('cle', 'delai_annulation')->first()->valeur);
        $this->assertEquals('true', Setting::where('cle', 'afficher_weekends')->first()->valeur);

        // Le parametre non modifie reste inchange
        $this->assertEquals(1, Setting::where('cle', 'premier_jour_semaine')->first()->valeur);
    }

    public function test_utilisateur_ne_peut_pas_modifier_plusieurs_parametres(): void
    {
        $response = $this->graphqlAsUser($this->mutation, [
            'settings' => [
                ['cle' => 'delai_annulation', 'valeur' => '10'],
            ],
        ], $this->utilisateur);

        $this->assertGraphQLError($response);

        // Valeur inchangee
        $this->assertEquals(5, Setting::where('cle', 'delai_annulation')->first()->valeur);
    }

    public function test_modification_tous_parametres_existants(): void
    {
        $response = $this->graphqlAsUser($this->mutation, [
            'settings' => [
                ['cle' => 'delai_annulation', 'valeur' => '15'],
                ['cle' => 'premier_jour_semaine', 'valeur' => '0'],
            ],
        ], $this->admin);

        $this->assertGraphQLSuccess($response);
        $data = $this->getGraphQLData($response, 'updateSettings');

        $this->assertCount(2, $data);
        $this->assertEquals('15', Setting::where('cle', 'delai_annulation')->first()->valeur);
        $this->assertEquals('0', Setting::where('cle', 'premier_jour_semaine')->first()->valeur);
    }

    public function test_non_authentifie_ne_peut_pas_modifier(): void
    {
        $response = $this->graphql($this->mutation, [
            'settings' => [
                ['cle' => 'delai_annulation', 'valeur' => '10'],
            ],
        ]);

        $this->assertGraphQLUnauthenticated($response);
    }
}
