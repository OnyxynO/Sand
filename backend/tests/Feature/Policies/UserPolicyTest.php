<?php

declare(strict_types=1);

namespace Tests\Feature\Policies;

use App\Models\Team;
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPolicyTest extends TestCase
{
    use RefreshDatabase;

    private UserPolicy $policy;
    private User $utilisateur;
    private User $moderateur;
    private User $admin;
    private User $autreUtilisateur;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new UserPolicy();

        $team = Team::factory()->create();

        $this->utilisateur      = User::factory()->create(['equipe_id' => $team->id, 'role' => 'utilisateur']);
        $this->moderateur       = User::factory()->create(['equipe_id' => $team->id, 'role' => 'moderateur']);
        $this->admin            = User::factory()->create(['equipe_id' => $team->id, 'role' => 'admin']);
        $this->autreUtilisateur = User::factory()->create(['equipe_id' => $team->id, 'role' => 'utilisateur']);
    }

    // ─── U-P06 : UTILISATEUR ne peut pas créer un utilisateur ────────────────

    public function test_utilisateur_ne_peut_pas_creer_utilisateur(): void
    {
        $this->assertFalse($this->policy->create($this->utilisateur));
    }

    public function test_moderateur_ne_peut_pas_creer_utilisateur(): void
    {
        $this->assertFalse($this->policy->create($this->moderateur));
    }

    // ─── A-P01 : ADMIN peut créer/modifier/supprimer un utilisateur ──────────

    public function test_admin_peut_creer_utilisateur(): void
    {
        $this->assertTrue($this->policy->create($this->admin));
    }

    public function test_admin_peut_modifier_utilisateur(): void
    {
        $this->assertTrue($this->policy->update($this->admin, $this->autreUtilisateur));
    }

    public function test_admin_peut_supprimer_autre_utilisateur(): void
    {
        $this->assertTrue($this->policy->delete($this->admin, $this->autreUtilisateur));
    }

    // ─── A-P02 : ADMIN ne peut pas se supprimer lui-même ─────────────────────

    public function test_admin_ne_peut_pas_se_supprimer_lui_meme(): void
    {
        $this->assertFalse($this->policy->delete($this->admin, $this->admin));
    }
}
