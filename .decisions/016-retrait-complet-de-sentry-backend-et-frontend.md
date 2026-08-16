---
date: '2026-08-16'
decideurs: []
id: 16
modules:
- backend
- frontend
- infra
statut: accepte
titre: Retrait complet de Sentry (backend et frontend)
---

## Contexte

Sentry avait été intégré côté backend (sentry/sentry-laravel) et frontend (@sentry/react) selon [[010]]. Un audit a révélé que le DSN backend (SENTRY_LARAVEL_DSN) était en réalité le DSN révoqué le 2026-03-29 (exposé publiquement dans le repo, puis révoqué) — jamais remplacé depuis. Le monitoring backend était donc silencieusement mort depuis mars 2026, sans que personne ne s'en aperçoive (aucune alerte, aucun symptôme visible). Le monitoring frontend, lui, était toujours actif et fonctionnel (DSN valide).

## Décision

Retrait complet de Sentry plutôt que réparation du DSN backend : jugé disproportionné pour les besoins actuels du projet (app à usage interne restreint, faible volume d'utilisateurs, pas d'astreinte on-call qui exploiterait activement les alertes).

Retiré :
- Backend : `sentry/sentry-laravel` (composer.json + composer.lock), `backend/config/sentry.php`, le bloc `->withExceptions(...)` de report vers Sentry dans `bootstrap/app.php` (remplacé par un `->withExceptions()` vide — nécessaire au bon fonctionnement du bootstrap Laravel, pas seulement à Sentry), variables `SENTRY_LARAVEL_DSN`/`SENTRY_TRACES_SAMPLE_RATE` (`.env.example`, `.env` prod).
- Frontend : `@sentry/react` (package.json + bun.lock), `Sentry.init(...)` dans `main.tsx`, tous les appels `Sentry.setUser(...)` dans `authStore.ts`, variable `VITE_SENTRY_DSN` (`.env.production.local` prod).

## Conséquences

Positifs : simplification (une dépendance de moins de chaque côté), plus de DSN morte trompeuse qui laissait croire à un monitoring actif, moins de surface de code à maintenir.

Négatifs : plus de remontée automatique des erreurs runtime backend/frontend en production. Repli : logs Laravel standard (`storage/logs/`) et logs Docker (`docker compose logs app`) restent la source de diagnostic en cas d'incident. Si le besoin de monitoring resurgit (croissance du volume d'utilisateurs, astreinte formalisée), reconsidérer Sentry ou une alternative plus légère avec un DSN correctement suivi cette fois (rotation documentée, vérification périodique de validité).
