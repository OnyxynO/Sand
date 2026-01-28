<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimeEntry>
 */
class TimeEntryFactory extends Factory
{
    protected $model = TimeEntry::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'project_id' => Project::factory(),
            'activity_id' => Activity::factory(),
            'date' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'duree' => fake()->randomFloat(2, 0.01, 1.00),
            'commentaire' => fake()->optional()->sentence(),
        ];
    }

    public function forUser(User $user): static
    {
        return $this->state(fn(array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    public function forProject(Project $project): static
    {
        return $this->state(fn(array $attributes) => [
            'project_id' => $project->id,
        ]);
    }

    public function forActivity(Activity $activity): static
    {
        return $this->state(fn(array $attributes) => [
            'activity_id' => $activity->id,
        ]);
    }

    public function onDate(string $date): static
    {
        return $this->state(fn(array $attributes) => [
            'date' => $date,
        ]);
    }
}
