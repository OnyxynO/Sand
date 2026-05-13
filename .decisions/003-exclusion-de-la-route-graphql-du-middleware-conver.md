---
date: '2026-02-24'
decideurs: []
id: 3
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Exclusion de la route /graphql du middleware ConvertEmptyStringsToNull
---

## Contexte

Le middleware ConvertEmptyStringsToNull de Laravel convertissait les chaînes vides en null sur les requêtes GraphQL, entraînant des erreurs de validation inattendues pour des champs optionnels.

## Décision

Exclure la route /graphql du middleware ConvertEmptyStringsToNull pour éviter les erreurs de validation causées par la conversion de chaînes vides en null.

## Conséquences

Consequences positives : évitement des erreurs de validation, meilleure gestion des cas de chaînes vides. Consequences négatives : possible dépendance de code existant sur le middleware, nécessité de réécriture de tests ou de migrations.