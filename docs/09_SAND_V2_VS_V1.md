# SAND v2 vs v1

## Positionnement

`sand-v2` n'est pas un rewrite fonctionnel. C'est une copie de travail isolee qui garde le meme produit, la meme stack
et les memes regles metier, mais pousse plus loin l'organisation interne du code et l'autonomie de l'environnement local.

## Ce qui change cote frontend

- la v1 reposait surtout sur une organisation par couches techniques: `pages/`, `components/`, `hooks/`, `stores/`
- la v2 introduit des domaines clairs dans `frontend/src/features/`
- la saisie, les notifications, l'auth, les projets, les stats, l'export et les zones admin ont des points d'entree v2
- les composants dashboard vivent maintenant dans `features/dashboard/components/`
- les anciens chemins restent presents comme wrappers de compatibilite, ce qui permet une migration progressive

## Ce qui change cote backend

- la v1 gardait encore plusieurs mutators GraphQL avec de la logique applicative directe
- la v2 a commence a sortir cette logique dans `backend/app/Services/`
- `TimeEntryService` et `WeeklyTimeEntryQueryService` existent deja
- la v2 ajoute aussi `ExportService` et `SettingService`
- l'objectif est de laisser aux mutators un role de couche d'entree mince: auth, adaptation des args, retour GraphQL

## Ce qui change cote environnement

- la v1 historique melangeait encore des attentes Docker et local natif selon les zones
- la v2 documente explicitement trois artefacts locaux:
  - `backend/.env.v2.local.example`
  - `backend/.env.testing.v2.local.example`
  - `frontend/.env.v2.local.example`
- la v2 fournit un bootstrap et un reset de base de test:
  - `scripts/bootstrap-v2.sh`
  - `scripts/reset-v2-test-db.sh`

## Etat de validation de la v2

Au moment de cette note:

- le frontend compile avec `npx tsc -b`
- les tests frontend cibles passent sur les zones refactorees
- le backend Laravel passe la suite `Feature` complete sur `sand_v2_test`

## Limites actuelles

- tous les composants partages ne sont pas encore migres dans `features/` ou `shared/`
- certains wrappers historiques existent encore pour ne pas casser les imports
- la v2 reste une base de refacto, pas une nouvelle branche de production

## Lecture recommandee

- `README_V2.md`
- `docs/08_SAND_V2.md`
- `docs/09_SAND_V2_VS_V1.md`
