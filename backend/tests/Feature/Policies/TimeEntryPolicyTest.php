<?php

declare(strict_types=1);

namespace Tests\Feature\Policies;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Team;
use App\Models\TimeEntry;
use App\Models\User;
use App\Policies\TimeEntryPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimeEntryPolicyTest extends TestCase
{
    use RefreshDatabase;

    private TimeEntryPolicy $policy;
    private User $utilisateur;
    private User $autreUtilisateur;
    private User $moderateur;
    private User $admin;
    private Project $projetModere;
    private Project $autreProjet;
    private Activity $activite;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new TimeEntryPolicy();

        $team = Team::factory()->create();

        $this->utilisateur      = User::factory()->create(['equipe_id' => $team->id, 'role' => 'utilisateur']);
        $this->autreUtilisateur = User::factory()->create(['equipe_id' => $team->id, 'role' => 'utilisateur']);
        $this->moderateur       = User::factory()->create(['equipe_id' => $team->id, 'role' => 'moderateur']);
        $this->admin            = User::factory()->create(['equipe_id' => $team->id, 'role' => 'admin']);

        $this->projetModere = Project::factory()->create();
        $this->autreProjet  = Project::factory()->create();

        // Le moderateur est assigne au projetModere uniquement
        $this->projetModere->moderateurs()->attach($this->moderateur->id);

        $this->activite = Activity::factory()->create(['est_feuille' => true, 'est_systeme' => false]);
    }

    // ─── U-P01 : UTILISATEUR peut créer une saisie pour lui-même ─────────────

    public function test_utilisateur_peut_creer_saisie_pour_lui_meme(): void
    {
        $this->assertTrue(
            $this->policy->create($this->utilisateur, $this->utilisateur->id, $this->projetModere->id)
        );
    }

    public function test_utilisateur_peut_creer_saisie_sans_target_user(): void
    {
        // targetUserId null = pour soi-meme
        $this->assertTrue(
            $this->policy->create($this->utilisateur, null, $this->projetModere->id)
        );
    }

    // ─── U-P02 : UTILISATEUR ne peut pas créer une saisie pour autrui ────────

    public function test_utilisateur_ne_peut_pas_creer_saisie_pour_autrui(): void
    {
        $this->assertFalse(
            $this->policy->create($this->utilisateur, $this->autreUtilisateur->id, $this->projetModere->id)
        );
    }

    // ─── U-P03 : UTILISATEUR peut modifier sa propre saisie ──────────────────

    public function test_utilisateur_peut_modifier_sa_propre_saisie(): void
    {
        $saisie = TimeEntry::factory()->create([
            'user_id'     => $this->utilisateur->id,
            'project_id'  => $this->projetModere->id,
            'activity_id' => $this->activite->id,
        ]);

        $this->assertTrue($this->policy->update($this->utilisateur, $saisie));
    }

    // ─── U-P04 : UTILISATEUR ne peut pas modifier la saisie d'un autre ───────

    public function test_utilisateur_ne_peut_pas_modifier_saisie_autrui(): void
    {
        $saisie = TimeEntry::factory()->create([
            'user_id'     => $this->autreUtilisateur->id,
            'project_id'  => $this->projetModere->id,
            'activity_id' => $this->activite->id,
        ]);

        $this->assertFalse($this->policy->update($this->utilisateur, $saisie));
    }

    public function test_utilisateur_ne_peut_pas_supprimer_saisie_autrui(): void
    {
        $saisie = TimeEntry::factory()->create([
            'user_id'     => $this->autreUtilisateur->id,
            'project_id'  => $this->projetModere->id,
            'activity_id' => $this->activite->id,
        ]);

        $this->assertFalse($this->policy->delete($this->utilisateur, $saisie));
    }

    // ─── M-P01 : MODERATEUR peut créer une saisie pour un utilisateur de son projet ──

    public function test_moderateur_peut_creer_saisie_pour_utilisateur_projet_modere(): void
    {
        $this->assertTrue(
            $this->policy->create($this->moderateur, $this->utilisateur->id, $this->projetModere->id)
        );
    }

    // ─── M-P02 : MODERATEUR ne peut pas créer une saisie sur un projet non assigné ──

    public function test_moderateur_ne_peut_pas_creer_saisie_projet_non_assigne(): void
    {
        $this->assertFalse(
            $this->policy->create($this->moderateur, $this->utilisateur->id, $this->autreProjet->id)
        );
    }

    public function test_moderateur_ne_peut_pas_creer_sans_projet(): void
    {
        // Sans projectId, impossible de verifier la moderation → refus
        $this->assertFalse(
            $this->policy->create($this->moderateur, $this->utilisateur->id, null)
        );
    }

    // ─── ADMIN peut tout faire ────────────────────────────────────────────────

    public function test_admin_peut_creer_saisie_pour_nimporte_quel_utilisateur(): void
    {
        $this->assertTrue(
            $this->policy->create($this->admin, $this->utilisateur->id, $this->autreProjet->id)
        );
    }

    public function test_admin_peut_modifier_nimporte_quelle_saisie(): void
    {
        $saisie = TimeEntry::factory()->create([
            'user_id'     => $this->utilisateur->id,
            'project_id'  => $this->projetModere->id,
            'activity_id' => $this->activite->id,
        ]);

        $this->assertTrue($this->policy->update($this->admin, $saisie));
    }
}
