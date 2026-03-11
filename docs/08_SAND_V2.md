# SAND v2

Copie de travail isolee du projet SAND, destinee a experimenter un refacto structurel sans aucun impact
sur la branche `main` du depot d'origine ni sur le pipeline de production.

## Objectifs

- regrouper le frontend par zones metier plutot que seulement par couche technique
- reduire les hooks/pages monolithiques sur le flux de saisie
- sortir la logique applicative des mutators GraphQL backend
- preparer une migration incrementale, pas un rewrite complet

## Premiere tranche implemente

### Frontend

- creation de `frontend/src/features/saisie/`
- extraction de la transformation des absences dans `lib/absences.ts`
- extraction du mapping et des payloads de sauvegarde dans `lib/saisieMapping.ts`
- nouveau hook feature-local `features/saisie/hooks/useSaisieHebdo.ts`
- compatibilite preservee via `frontend/src/hooks/useSaisieHebdo.ts` qui re-exporte la nouvelle implementation

### Backend

- creation de `backend/app/Services/TimeEntryService.php`
- `TimeEntryMutator` reduit a un orchestrateur mince
- centralisation de la validation, des transactions, des checks d'autorisation et des logs de saisie

### Shell applicatif

- routes de l'application extraites dans `frontend/src/features/app/router.tsx`
- navigation extraite dans `frontend/src/features/app/navigation.ts`
- bootstrap de session deplace dans `features/auth/hooks/useAuthSessionBootstrap.ts`
- logique notifications deplacee dans `features/notifications/hooks/`
- query hebdomadaire backend deplacee dans `backend/app/Services/WeeklyTimeEntryQueryService.php`

### Domaines en cours de migration

- `projets` bascule vers `frontend/src/features/projets/`
- `admin/activities` recoit une entree v2 sous `frontend/src/features/admin/activities/`
- `stats` et `export` passent aussi par des points d'entree `features/`
- `admin/configuration`, `admin/users`, `admin/teams`, `admin/rgpd` recoivent une facade v2
- les pages historiques restent presentes comme wrappers de compatibilite

## Garde-fou Git

Dans cette copie, le remote de push a ete desactive (`upstream` fetch only, push URL invalide) pour eviter
tout push accidentel vers le depot qui pilote la production.

## Execution autonome

- `backend/.env.v2.local.example` decrit le mode local natif de la copie v2
- `frontend/.env.v2.local.example` fixe `VITE_API_URL` vers le backend local
- `scripts/bootstrap-v2.sh` prepare les `.env` et installe les dependances manquantes
- objectif : pouvoir faire tourner `sand-v2` sans symlink obligatoire vers le repo source
