---
date: '2026-02-19'
decideurs: []
id: 2
modules:
- liste
- des
- modules
- concernés
statut: accepte
titre: Remplacement des tokens Bearer par des cookies Sanctum en mode HttpOnly + CSRF
---

## Contexte

La présence de tokens Bearer côté client posait un risque XSS, tandis que l'usage de Sanctum SPA en mode cookies offre une meilleure sécurité et conformité pour une application web/SPA.

## Décision

La désactivation des tokens Bearer et la mise en place des cookies Sanctum en mode HttpOnly + CSRF est nécessaire pour renforcer la sécurité des communications entre le client et le serveur.

## Conséquences

Conséquences positives : amélioration de la sécurité, réduction des risques XSS. Conséquences négatives : complexité d'implémentation initiale, nécessité de migration vers les cookies Sanctum.