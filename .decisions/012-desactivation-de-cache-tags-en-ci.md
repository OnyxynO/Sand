---
date: '2026-04-08'
decideurs: []
id: 12
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Désactivation de Cache::tags() en CI
---

## Contexte

La connexion rapide (connexion_rapide) utilise le driver array en CI, incompatible avec Cache::tags() qui nécessite un driver Redis. Cette décision est motivée par la contrainte technique de l'environnement de développement.

## Décision

La connexion rapide (connexion_rapide) ne utilise plus Cache::tags() car le driver Redis est absent en CI. Cette approche évite les erreurs de cache et respecte les contraintes du moteur de développement.

## Conséquences

{'positives': ['Evite les erreurs de cache en cas de dérivation', 'Synchronise correctement avec le driver array en CI'], 'négatives': ['Pouvoir être optimisée pour des cas de cache plus complexes', 'Évite de gérer des cas de cache non standard']}