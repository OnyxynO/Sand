<?php

namespace App\Providers;

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
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Le lien de reinitialisation doit pointer vers le frontend React,
        // pas vers le backend Laravel (qui n'a pas de page de reset).
        ResetPassword::createUrlUsing(function (User $user, string $token): string {
            $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
            return $frontendUrl . '/reinitialiser-mdp?token=' . $token . '&email=' . urlencode($user->email);
        });

        // Enregistrer les policies
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Team::class, TeamPolicy::class);
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Activity::class, ActivityPolicy::class);
        Gate::policy(TimeEntry::class, TimeEntryPolicy::class);
        Gate::policy(Absence::class, AbsencePolicy::class);
        Gate::policy(Setting::class, SettingPolicy::class);
    }
}
