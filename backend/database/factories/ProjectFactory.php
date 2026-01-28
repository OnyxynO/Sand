<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->words(3, true),
            'code' => fake()->unique()->lexify('????'),
            'description' => fake()->optional()->paragraph(),
            'date_debut' => fake()->optional()->date(),
            'date_fin' => fake()->optional()->date(),
            'est_actif' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'est_actif' => false,
        ]);
    }
}
