<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function (): void {
            // Routes sans aucun middleware (pas de session, pas de CSRF, pas de StartSession).
            // Enregistrées directement via Route::get() pour garantir qu'aucun groupe web
            // ne s'applique, même partiellement.
            require __DIR__.'/../routes/bare.php';
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // GraphQL gere ses propres types — ne pas convertir "" en null pour l'endpoint /graphql
        $middleware->convertEmptyStringsToNull(except: [
            fn (Request $request) => $request->is('graphql'),
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (Throwable $e): void {
            if (app()->bound('sentry')) {
                app('sentry')->captureException($e);
            }
        });
    })->create();
