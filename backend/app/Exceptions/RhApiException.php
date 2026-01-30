<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

/**
 * Exception pour les erreurs de l'API RH externe.
 */
class RhApiException extends Exception
{
    protected int $httpCode;

    protected ?array $responseData;

    public function __construct(
        string $message,
        int $httpCode = 0,
        ?array $responseData = null,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $httpCode, $previous);
        $this->httpCode = $httpCode;
        $this->responseData = $responseData;
    }

    /**
     * Erreur de connexion a l'API RH
     */
    public static function connexionEchouee(string $raison): self
    {
        return new self("Impossible de se connecter a l'API RH : {$raison}");
    }

    /**
     * Timeout de l'API RH
     */
    public static function timeout(): self
    {
        return new self("L'API RH n'a pas repondu dans le delai imparti");
    }

    /**
     * Reponse invalide de l'API RH
     */
    public static function reponseInvalide(string $details = ''): self
    {
        $message = "L'API RH a retourne une reponse invalide";
        if ($details) {
            $message .= " : {$details}";
        }

        return new self($message);
    }

    /**
     * Erreur HTTP de l'API RH
     */
    public static function erreurHttp(int $code, ?array $response = null): self
    {
        $message = "L'API RH a retourne une erreur HTTP {$code}";
        if ($response && isset($response['error'])) {
            $message .= " : {$response['error']}";
        }

        return new self($message, $code, $response);
    }

    /**
     * API RH non disponible
     */
    public static function serviceIndisponible(): self
    {
        return new self("L'API RH est actuellement indisponible");
    }

    public function getHttpCode(): int
    {
        return $this->httpCode;
    }

    public function getResponseData(): ?array
    {
        return $this->responseData;
    }
}
