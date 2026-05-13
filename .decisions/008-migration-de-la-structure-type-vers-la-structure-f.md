---
date: '2026-03-11'
decideurs: []
id: 8
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Migration de la structure type vers la structure feature dans Sand v2
---

## Contexte

La migration de la structure type (components/pages) vers une structure par feature (features/entities) est nécessaire pour améliorer l'isolation des responsabilités et réduire le couplage entre modules.

## Décision

La structure de l'architecture est restructurée en utilisant la Design by Feature (FSD) pour décentraliser les responsabilités et faciliter la maintenance.

## Conséquences

{'positives': ["Amélioration de l'isolation des responsabilités", 'Réduction du couplage entre modules', 'Facilitation de la maintenance et du test'], 'négatives': ['Complexité accrue pendant la migration', 'Nécessité de réécrire des modules existants', 'Apprentissage supplémentaire pour les développeurs']}