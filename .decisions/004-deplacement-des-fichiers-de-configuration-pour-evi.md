---
date: '2026-02-27'
decideurs: []
id: 4
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Déplacement des fichiers de configuration pour éviter les conflits entre app.conf
  et app.prod.conf
---

## Contexte

Le volume conf.d montait simultanément les deux configurations (app.conf et app.prod.conf), entraînant des conflits de serveur block nginx dans le développement.

## Décision

Déplacer le fichier app.prod.conf vers le dossier docker/nginx/prod pour éviter les conflits de serveur block nginx dans le développement.

## Conséquences

['Éviter les conflits de serveur block nginx dans le développement', 'Améliorer la stabilité des configurations']