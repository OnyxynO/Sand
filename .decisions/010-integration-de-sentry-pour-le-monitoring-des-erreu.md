---
date: '2026-03-19'
decideurs: []
id: 10
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Intégration de Sentry pour le monitoring des erreurs en production
---

## Contexte

L'intégration de Sentry est nécessaire pour le monitoring des erreurs en production. Le DSN est configuré via des variables d'environnement (SENTRY_LARAVEL_DSN côté backend, VITE_SENTRY_DSN côté frontend). Le monitoring est désactivé en dev frontend (enabled: import.meta.env.PROD). Un contexte utilisateur est ajouté aux événements.

## Décision

L'intégration de Sentry est activée en production avec les DSN configurés via des variables d'environnement. Le monitoring est désactivé en dev frontend, et un contexte utilisateur est ajouté aux événements pour améliorer la dérivation des erreurs.

## Conséquences

Conseillés : amélioration du monitoring des erreurs, contexte utilisateur pour la dérivation des erreurs. Négatifs : risque de sécurité si les DSN sont exposés, mais cela est évité en production.