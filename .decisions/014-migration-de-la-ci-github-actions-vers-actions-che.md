---
date: '2026-04-08'
decideurs: []
id: 14
modules:
- actions/checkout@v5
- setup-node@v5
- Node 24
statut: accepte
titre: Migration de la CI GitHub Actions vers actions/checkout@v5 et setup-node@v5
---

## Contexte

Migration de la CI GitHub Actions vers actions/checkout@v5 et setup-node@v5 pour éviter les warnings bloquants liés à la dépréciation de Node 20 sur GitHub Actions.

## Décision

Migrer la CI GitHub Actions vers actions/checkout@v5 et setup-node@v5 (Node 24) afin d'éviter les avertissements de dépréciation de Node 20 et garantir la compatibilité avec les nouvelles versions de GitHub Actions.

## Conséquences

Conseillers positifs : amélioration de la compatibilité, réduction des warnings, et préparation à la future version de GitHub Actions. Consequences négatives : transition temporaire, nécessité de réécriture des workflows, et risque de bugs temporaires pendant la migration.