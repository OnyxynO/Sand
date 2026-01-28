<?php

namespace Database\Factories;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Activity>
 */
class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    private static int $ordre = 0;

    public function definition(): array
    {
        self::$ordre++;

        return [
            'nom' => fake()->words(2, true),
            'code' => fake()->optional()->lexify('???'),
            'description' => fake()->optional()->sentence(),
            'parent_id' => null,
            'chemin' => (string) self::$ordre,
            'niveau' => 0,
            'ordre' => self::$ordre,
            'est_feuille' => true,
            'est_systeme' => false,
            'est_actif' => true,
        ];
    }

    public function parent(): static
    {
        return $this->state(fn(array $attributes) => [
            'est_feuille' => false,
        ]);
    }

    public function systeme(): static
    {
        return $this->state(fn(array $attributes) => [
            'est_systeme' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'est_actif' => false,
        ]);
    }
}
