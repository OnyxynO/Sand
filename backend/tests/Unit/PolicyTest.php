<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Absence;
use App\Models\Activity;
use App\Models\Project;
use App\Models\Setting;
use App\Models\Team;
use App\Models\TimeEntry;
use App\Models\User;
use App\Policies\AbsencePolicy;
use App\Policies\ActivityPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\SettingPolicy;
use App\Policies\TeamPolicy;
use App\Policies\TimeEntryPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PolicyTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $moderateur;
    private User $utilisateur;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->moderateur = User::factory()->moderateur()->create();
        $this->utilisateur = User::factory()->create();
    }

    // === UserPolicy ===

    public function test_user_policy_create_admin_seulement(): void
    {
        $policy = new UserPolicy();

        $this->assertTrue($policy->create($this->admin));
        $this->assertFalse($policy->create($this->moderateur));
        $this->assertFalse($policy->create($this->utilisateur));
    }

    public function test_user_policy_update_admin_seulement(): void
    {
        $policy = new UserPolicy();
        $cible = User::factory()->create();

        $this->assertTrue($policy->update($this->admin, $cible));
        $this->assertFalse($policy->update($this->moderateur, $cible));
        $this->assertFalse($policy->update($this->utilisateur, $cible));
    }

    public function test_user_policy_delete_admin_pas_soi_meme(): void
    {
        $policy = new UserPolicy();
        $autre = User::factory()->create();

        $this->assertTrue($policy->delete($this->admin, $autre));
        $this->assertFalse($policy->delete($this->admin, $this->admin));
        $this->assertFalse($policy->delete($this->moderateur, $autre));
    }

    public function test_user_policy_restore_admin_seulement(): void
    {
        $policy = new UserPolicy();

        $this->assertTrue($policy->restore($this->admin));
        $this->assertFalse($policy->restore($this->moderateur));
        $this->assertFalse($policy->restore($this->utilisateur));
    }

    // === TeamPolicy ===

    public function test_team_policy_crud_admin_seulement(): void
    {
        $policy = new TeamPolicy();
        $team = Team::factory()->create();

        $this->assertTrue($policy->create($this->admin));
        $this->assertFalse($policy->create($this->moderateur));

        $this->assertTrue($policy->update($this->admin, $team));
        $this->assertFalse($policy->update($this->moderateur, $team));

        $this->assertTrue($policy->delete($this->admin, $team));
        $this->assertFalse($policy->delete($this->utilisateur, $team));
    }

    // === ProjectPolicy ===

    public function test_project_policy_create_admin_seulement(): void
    {
        $policy = new ProjectPolicy();

        $this->assertTrue($policy->create($this->admin));
        $this->assertFalse($policy->create($this->moderateur));
    }

    public function test_project_policy_update_admin_ou_moderateur_assigne(): void
    {
        $policy = new ProjectPolicy();
        $project = Project::factory()->create();

        // Admin peut toujours
        $this->assertTrue($policy->update($this->admin, $project));

        // Moderateur non assigne ne peut pas
        $this->assertFalse($policy->update($this->moderateur, $project));

        // Moderateur assigne peut
        $this->moderateur->projetsModeres()->attach($project->id);
        $this->assertTrue($policy->update($this->moderateur, $project));

        // Utilisateur ne peut jamais
        $this->assertFalse($policy->update($this->utilisateur, $project));
    }

    public function test_project_policy_delete_admin_seulement(): void
    {
        $policy = new ProjectPolicy();
        $project = Project::factory()->create();

        $this->assertTrue($policy->delete($this->admin, $project));
        $this->assertFalse($policy->delete($this->moderateur, $project));
    }

    public function test_project_policy_manage_moderators_admin_seulement(): void
    {
        $policy = new ProjectPolicy();
        $project = Project::factory()->create();

        $this->assertTrue($policy->manageModerators($this->admin, $project));
        $this->assertFalse($policy->manageModerators($this->moderateur, $project));
    }

    public function test_project_policy_manage_visibility_admin_seulement(): void
    {
        $policy = new ProjectPolicy();
        $project = Project::factory()->create();

        $this->assertTrue($policy->manageVisibility($this->admin, $project));
        $this->assertFalse($policy->manageVisibility($this->moderateur, $project));
    }

    // === ActivityPolicy ===

    public function test_activity_policy_create_admin_seulement(): void
    {
        $policy = new ActivityPolicy();

        $this->assertTrue($policy->create($this->admin));
        $this->assertFalse($policy->create($this->moderateur));
    }

    public function test_activity_policy_update_bloque_systeme(): void
    {
        $policy = new ActivityPolicy();
        $activite = Activity::factory()->create(['est_systeme' => false]);
        $systeme = Activity::factory()->create(['est_systeme' => true]);

        $this->assertTrue($policy->update($this->admin, $activite));
        $this->assertFalse($policy->update($this->admin, $systeme));
    }

    public function test_activity_policy_delete_bloque_systeme(): void
    {
        $policy = new ActivityPolicy();
        $activite = Activity::factory()->create(['est_systeme' => false]);
        $systeme = Activity::factory()->create(['est_systeme' => true]);

        $this->assertTrue($policy->delete($this->admin, $activite));
        $this->assertFalse($policy->delete($this->admin, $systeme));
        $this->assertFalse($policy->delete($this->moderateur, $activite));
    }

    // === TimeEntryPolicy ===

    public function test_time_entry_policy_proprietaire_peut_modifier(): void
    {
        $policy = new TimeEntryPolicy();
        $project = Project::factory()->create();
        $activity = Activity::factory()->create();

        $saisie = TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $project->id,
            'activity_id' => $activity->id,
        ]);

        $this->assertTrue($policy->update($this->utilisateur, $saisie));
        $this->assertTrue($policy->delete($this->utilisateur, $saisie));
    }

    public function test_time_entry_policy_moderateur_projet_peut_modifier(): void
    {
        $policy = new TimeEntryPolicy();
        $project = Project::factory()->create();
        $activity = Activity::factory()->create();

        $saisie = TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $project->id,
            'activity_id' => $activity->id,
        ]);

        // Admin peut toujours (peutModererProjet retourne true)
        $this->assertTrue($policy->update($this->admin, $saisie));

        // Moderateur assigne peut
        $this->moderateur->projetsModeres()->attach($project->id);
        $this->assertTrue($policy->update($this->moderateur, $saisie));
    }

    public function test_time_entry_policy_autre_utilisateur_ne_peut_pas(): void
    {
        $policy = new TimeEntryPolicy();
        $project = Project::factory()->create();
        $activity = Activity::factory()->create();
        $autre = User::factory()->create();

        $saisie = TimeEntry::factory()->create([
            'user_id' => $this->utilisateur->id,
            'project_id' => $project->id,
            'activity_id' => $activity->id,
        ]);

        $this->assertFalse($policy->update($autre, $saisie));
        $this->assertFalse($policy->delete($autre, $saisie));
    }

    // === AbsencePolicy ===

    public function test_absence_policy_sync_moderateur_ou_admin(): void
    {
        $policy = new AbsencePolicy();

        $this->assertTrue($policy->sync($this->admin));
        $this->assertTrue($policy->sync($this->moderateur));
        $this->assertFalse($policy->sync($this->utilisateur));
    }

    public function test_absence_policy_create_moderateur_ou_admin(): void
    {
        $policy = new AbsencePolicy();

        $this->assertTrue($policy->create($this->admin));
        $this->assertTrue($policy->create($this->moderateur));
        $this->assertFalse($policy->create($this->utilisateur));
    }

    // === SettingPolicy ===

    public function test_setting_policy_update_admin_seulement(): void
    {
        $policy = new SettingPolicy();

        $this->assertTrue($policy->update($this->admin));
        $this->assertFalse($policy->update($this->moderateur));
        $this->assertFalse($policy->update($this->utilisateur));
    }
}
