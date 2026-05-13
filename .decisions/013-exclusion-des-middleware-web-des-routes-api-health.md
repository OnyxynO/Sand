---
date: '2026-04-08'
decideurs: []
id: 13
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Exclusion des middleware web des routes /api/health et /api/config/publique
---

## Contexte

Le middleware StartSession et VerifyCsrfToken tentait de créer une session Redis inexistante, ce qui entraînait des checks de santé Docker inéfficaces avant que Redis soit disponible.

## Décision

Les routes /api/health et /api/config/publique sont exclues des middleware web pour éviter les checks de santé inéfficaces avant la disponibilité de Redis.

## Conséquences

{'positives': ['Les checks de santé Docker sont maintenant corrects après la disponibilité de Redis'], 'négatives': []}