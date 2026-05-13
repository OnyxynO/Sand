---
date: '2026-04-07'
decideurs: []
id: 11
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Forçage de lodash >=4.18.0 via override npm
---

## Contexte

La dépendance lodash est exposée à une vulnérabilité CVE dans les versions antérieures à 4.18.0. L'override npm est nécessaire car les mainteneurs ne font pas les mises à jour des dépendances transitives.

## Décision

La décision est de forcer la version lodash à 4.18.0 via un override npm pour éviter les vulnérabilités et garantir la sécurité des dépendances transitives.

## Conséquences

{'positives': ['Évitation des vulnérabilités CVE', 'Sécurité améliorée'], 'négatives': ['Dépendance spécifique à une version ancienne', 'Risque de dépendance à une version non mise à jour']}