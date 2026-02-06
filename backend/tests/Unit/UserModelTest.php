<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_nom_complet_attribut(): void
    {
        $user = User::factory()->create(['nom' => 'Dupont', 'prenom' => 'Jean']);
        $this->assertEquals('Jean Dupont', $user->nomComplet);
    }

    public function test_est_admin_avec_role_admin(): void
    {
        $user = User::factory()->admin()->create();
        $this->assertTrue($user->estAdmin());
    }

    public function test_est_admin_avec_role_utilisateur(): void
    {
        $user = User::factory()->create();
        $this->assertFalse($user->estAdmin());
    }

    public function test_est_moderateur_avec_role_moderateur(): void
    {
        $user = User::factory()->moderateur()->create();
        $this->assertTrue($user->estModerateur());
    }

    public function test_est_moderateur_avec_role_admin(): void
    {
        $user = User::factory()->admin()->create();
        $this->assertTrue($user->estModerateur());
    }

    public function test_est_moderateur_avec_role_utilisateur(): void
    {
        $user = User::factory()->create();
        $this->assertFalse($user->estModerateur());
    }

    public function test_peut_moderer_projet_en_tant_admin(): void
    {
        $user = User::factory()->admin()->create();
        $project = Project::factory()->create();
        $this->assertTrue($user->peutModererProjet($project));
    }

    public function test_peut_moderer_projet_assigne(): void
    {
        $user = User::factory()->moderateur()->create();
        $project = Project::factory()->create();
        $user->projetsModeres()->attach($project->id);

        $this->assertTrue($user->peutModererProjet($project));
    }

    public function test_ne_peut_pas_moderer_projet_non_assigne(): void
    {
        $user = User::factory()->moderateur()->create();
        $project = Project::factory()->create();

        $this->assertFalse($user->peutModererProjet($project));
    }

    public function test_scope_actif(): void
    {
        User::factory()->create(['est_actif' => true]);
        User::factory()->inactive()->create();

        $actifs = User::actif()->get();
        $this->assertCount(1, $actifs);
    }

    public function test_scope_role(): void
    {
        User::factory()->admin()->create();
        User::factory()->moderateur()->create();
        User::factory()->create(); // utilisateur par defaut

        $admins = User::role('admin')->get();
        $this->assertCount(1, $admins);
    }

    public function test_soft_delete(): void
    {
        $user = User::factory()->create();
        $user->delete();

        $this->assertSoftDeleted('users', ['id' => $user->id]);
        $this->assertNotNull(User::withTrashed()->find($user->id));
    }

    public function test_relation_equipe(): void
    {
        $team = Team::factory()->create();
        $user = User::factory()->create(['equipe_id' => $team->id]);

        $this->assertEquals($team->id, $user->equipe->id);
    }
}
