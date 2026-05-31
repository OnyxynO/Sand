---
date: '2026-05-02'
decideurs: []
id: 15
modules:
- liste
- des
- modules
- concernés
statut: remplace
titre: Migration de Dockerfile.prod vers Node.js 22 LTS pour compatibilité avec Vite
  8
---

## Contexte

La migration vers Node.js 22 LTS est nécessaire pour garantir la compatibilité avec Vite 8 (requiert Node 18+), tout en préparant les builds de production pour le futur.

## Décision

La migration du Dockerfile.prod vers Node.js 22 LTS est effectuée afin d'assurer la compatibilité avec Vite 8 (Node 18+) et de maintenir des builds de production stables et à long terme.

## Conséquences

{'positives': ['Compatibilité avec Vite 8', 'Stabilité des builds de production', 'Support pour le futur'], 'négatives': ['Risque de dépendances non compatibles', 'Nécessité de tests approfondis', 'Possibilité de performances réduites']}