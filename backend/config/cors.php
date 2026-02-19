<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'graphql', 'sanctum/csrf-cookie'],

    // GET : GraphQL playground/introspection | POST : mutations et queries | OPTIONS : preflight
    'allowed_methods' => ['GET', 'POST', 'OPTIONS'],

    // Origine unique via variable d'environnement — plus de ports dev hardcodes
    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'),
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 7200, // Cache les preflights OPTIONS 2h (evite un aller-retour OPTIONS par requete)

    'supports_credentials' => true,

];
