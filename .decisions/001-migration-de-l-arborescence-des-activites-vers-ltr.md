---
date: '2026-01-31'
decideurs: []
id: 1
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Migration de l'arborescence des activités vers ltree PostgreSQL
---

## Contexte

La complexité du modèle d'arborescence de fermeture rendait difficile la maintenance et la scalabilité. Le besoin d'une solution plus performante et facile à utiliser a conduit à l'analyse des fonctionnalités de ltree PostgreSQL.

## Décision

Migrer l'arborescence des activités vers PostgreSQL ltree pour bénéficier des opérateurs natifs (<@, @>) et de l'index GiST optimisés pour les requêtes hiérarchiques.

## Conséquences

{'positives': ['Amélioration des performances des requêtes hiérarchiques', 'Simplification de la maintenance et de la gestion des arbres', 'Support natif des opérateurs <@ et @ pour les opérations de recherche et de suppression'], 'négatives': ['Déploiement initial et adaptation des codes existants', 'Perte de compatibilité avec les anciennes structures de données', 'Nécessité de réécriture de certains algorithmes de gestion des arbres']}