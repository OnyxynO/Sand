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

## Garde-fou Git

Dans cette copie, le remote de push a ete desactive (`upstream` fetch only, push URL invalide) pour eviter
tout push accidentel vers le depot qui pilote la production.
