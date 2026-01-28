<?php

declare(strict_types=1);

namespace Tests\Traits;

use App\Models\User;
use Illuminate\Testing\TestResponse;

trait GraphQLTestTrait
{
    /**
     * Executer une requete GraphQL.
     */
    protected function graphql(string $query, array $variables = [], ?User $user = null): TestResponse
    {
        $request = $this->postJson('/graphql', [
            'query' => $query,
            'variables' => $variables,
        ]);

        if ($user) {
            $request = $this->actingAs($user, 'sanctum')
                ->postJson('/graphql', [
                    'query' => $query,
                    'variables' => $variables,
                ]);
        }

        return $request;
    }

    /**
     * Executer une requete GraphQL authentifiee.
     */
    protected function graphqlAsUser(string $query, array $variables = [], ?User $user = null): TestResponse
    {
        $user = $user ?? User::factory()->create();

        return $this->actingAs($user, 'sanctum')
            ->postJson('/graphql', [
                'query' => $query,
                'variables' => $variables,
            ]);
    }

    /**
     * Verifier qu'une requete GraphQL a reussi.
     */
    protected function assertGraphQLSuccess(TestResponse $response): void
    {
        $response->assertOk();
        $response->assertJsonMissingPath('errors');
    }

    /**
     * Verifier qu'une requete GraphQL a echoue avec une erreur.
     */
    protected function assertGraphQLError(TestResponse $response, ?string $message = null): void
    {
        $response->assertOk();
        $response->assertJsonPath('errors.0.message', $message ?? fn($value) => !empty($value));
    }

    /**
     * Verifier qu'une requete GraphQL a echoue avec "Unauthenticated".
     */
    protected function assertGraphQLUnauthenticated(TestResponse $response): void
    {
        $this->assertGraphQLError($response, 'Unauthenticated.');
    }

    /**
     * Extraire les donnees d'une reponse GraphQL.
     */
    protected function getGraphQLData(TestResponse $response, string $key): mixed
    {
        return $response->json("data.{$key}");
    }
}
