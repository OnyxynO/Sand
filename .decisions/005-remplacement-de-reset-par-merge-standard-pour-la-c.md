---
date: '2026-02-27'
decideurs: []
id: 5
modules: []
statut: accepte
titre: Remplacement de !reset par merge standard pour la configurat
---

## Contexte



## Décision

Remplacement de !reset par merge standard pour la configuration des ports nginx dans Docker Compose v5. La syntaxe !reset n'est pas supportée en Compose v5, ce qui provoquait une erreur au démarrage.

## Conséquences