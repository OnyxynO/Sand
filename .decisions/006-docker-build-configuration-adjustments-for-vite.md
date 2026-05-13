---
date: '2026-02-27'
decideurs: []
id: 6
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Docker Build Configuration Adjustments for Vite
---

## Contexte

Le build Docker utilise uniquement le build Vite sans transpilation avec tsc. Le tsc n'est pas disponible dans le contexte Docker sans les types Lighthouse générés à chaud. La contrainte acceptée est que les types sont vérifiés en CI séparément.

## Décision

Le build Docker sera ajusté pour utiliser uniquement le build Vite sans transpilation avec tsc. Les types seront vérifiés en CI séparément pour éviter les contraintes liées au contexte Docker.

## Conséquences

Consequences positives : Aucune dépendance sur tsc dans Docker, amélioration de la performance. Consequences négatives : Les types seront vérifiés en CI, ce qui complexifie la chaîne de build.