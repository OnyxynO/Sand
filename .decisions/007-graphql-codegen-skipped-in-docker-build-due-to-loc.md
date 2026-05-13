---
date: '2026-02-27'
decideurs: []
id: 7
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: GraphQL Codegen Skipped in Docker Build Due to Local Directory and Lighthouse
  Types Issue
---

## Contexte

Le codegen GraphQL est sauté dans le build Docker car le dossier src/gql est commité et les types Lighthouse ne sont pas disponibles hors connexion HTTP au moment du build.

## Décision

Le codegen GraphQL est sauté dans le build Docker pour éviter les erreurs liées à l'absence de connexion HTTP aux types Lighthouse, en raison du commit du dossier src/gql.

## Conséquences

Conséquences positives : évitement des erreurs de build. Conséquences négatives : augmentation du temps de build et risque de dépendance sur le codegen.