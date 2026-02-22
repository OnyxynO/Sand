<?php

declare(strict_types=1);

namespace App\GraphQL\Scalars;

use GraphQL\Error\Error;
use GraphQL\Language\AST\Node;
use GraphQL\Type\Definition\ScalarType;

/**
 * Scalar JSON corrige : retourne la valeur PHP telle quelle depuis serialize().
 *
 * Le scalar MLL\GraphQLScalars\JSON fait json_encode() dans serialize(),
 * ce qui provoque un double encodage : graphql-php encode ensuite la string
 * resultante pour le JSON HTTP, ajoutant des guillemets superflus.
 *
 * Ce scalar retourne la valeur directement pour que graphql-php s'occupe
 * du seul encodage JSON necessaire.
 */
class JsonScalar extends ScalarType
{
    public ?string $description = 'Donnees JSON arbitraires.';

    /**
     * Serialiser une valeur PHP pour l'output GraphQL.
     * Retourne la valeur telle quelle — graphql-php se charge de l'encoder en JSON.
     */
    public function serialize($value): mixed
    {
        return $value;
    }

    /**
     * Convertir une valeur variable JSON en valeur PHP.
     * graphql-php passe la valeur deja decodee du JSON du corps de la requete.
     */
    public function parseValue($value): mixed
    {
        return $value;
    }

    /**
     * Convertir un literal AST GraphQL en valeur PHP.
     */
    public function parseLiteral(Node $valueNode, ?array $variables = null): mixed
    {
        if (property_exists($valueNode, 'value')) {
            return $valueNode->value;
        }

        throw new Error('Cannot parse literal: '.get_class($valueNode));
    }
}
