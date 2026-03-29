# Notes de reprise - Session suivante

## Demarrage rapide apres redemarrage

```bash
# 1. Lancer Docker Desktop d'abord !

# 2. Puis lancer l'environnement :
cd "/Users/seb/Documents/Claude projet/Code/saelv1 vers sandv2"
./start-dev.sh

# Ou manuellement :
docker-compose up -d db redis
cd backend && php artisan serve --host=0.0.0.0 --port=8080 &
cd frontend && npm run dev &
```

**URLs :**
- Frontend : http://localhost:5173
- Backend : http://localhost:8080
- GraphiQL : http://localhost:8080/graphiql

**Compte admin :** `admin@sand.local` / `password`

---

## Etat actuel (2026-01-30)

### Phase 2 du backlog : quasi-complete

**Termine :**
- US-2.1 : CRUD Utilisateurs (`/admin/utilisateurs`)
- US-2.2 : CRUD Equipes (`/admin/equipes`)
- US-2.3 : Arborescence activites (`/admin/activites`)
- US-2.4 : CRUD Projets avec tri-state (`/projets`)
- US-2.5 : Toast d'annulation (composant `ToastAnnulation.tsx`)
- US-2.7 : Interface de saisie hebdomadaire (`/saisie`)
- US-2.8 : Blocage semaines futures
- US-2.9 : Unicite des saisies (contrainte en base)
- US-2.10 : Historique des modifications (backend OK)

**En attente :**
- US-2.6 : Visibilite par utilisateur - necessite implementation backend

### Phase 3 du backlog : en cours

**Termine :**
- US-3.1 : Mock service RH (container Docker `mock-rh` sur port 3001)
- US-3.2 : Import des absences depuis l'API RH
  - `RhApiClient.php` : client HTTP avec getAbsences() et healthCheck()
  - `AbsenceMutator.php` : mutation syncAbsences complete
  - Detection automatique des conflits avec saisies existantes
  - Notifications creees (TYPE_ABSENCE_IMPORTEE ou TYPE_CONFLIT_ABSENCE)
  - Teste et valide (5 imports, 1 conflit detecte, idempotence OK)

**En attente :**
- US-3.3 : Gestion des conflits absences (interface de resolution)
- US-3.4 : Droits moderateur
- US-3.5 : Page de supervision
- US-3.6 : Systeme de notifications (UI cloche + panneau)

### Prochaines etapes possibles

1. **Implementer US-3.3** : Interface de resolution des conflits
   - Afficher les conflits dans les notifications
   - Permettre de choisir "garder saisie" ou "garder absence"

2. **Implementer US-3.6** : UI des notifications
   - Icone cloche dans le header
   - Badge compteur non lues
   - Panneau lateral listant les notifications

3. **Corriger les bugs restants** (voir TODO_BUGS.md) :
   - BUG-001 : Trim login (espaces non supprimes)
   - BUG-002 : Hot reload Vite intermittent

---

## Fichiers cles a connaitre

### Frontend
```
frontend/src/
+-- pages/
|   +-- LoginPage.tsx
|   +-- DashboardPage.tsx
|   +-- SaisiePage.tsx
|   +-- ProjetsPage.tsx
|   +-- admin/
|       +-- UtilisateursPage.tsx
|       +-- EquipesPage.tsx
|       +-- ActivitesPage.tsx
+-- components/
|   +-- saisie/           # Composants grille saisie
|   +-- admin/            # FormulaireUtilisateur, NavAdmin
|   +-- ui/               # ToastAnnulation
+-- graphql/operations/   # Queries et mutations
+-- stores/               # Zustand (authStore, saisieStore)
+-- hooks/                # useAuthInit, useSaisieHebdo
+-- utils/                # semaineUtils
```

### Backend
```
backend/
+-- app/GraphQL/          # Resolvers
|   +-- Mutations/
|       +-- AbsenceMutator.php  # syncAbsences, create, resolveConflict
+-- app/Services/
|   +-- RhApiClient.php         # Client API RH (getAbsences, healthCheck)
+-- app/Exceptions/
|   +-- RhApiException.php      # Exceptions API RH
+-- graphql/              # Schema GraphQL (types/, inputs/, mutations/)
+-- app/Models/           # Eloquent
+-- config/services.php   # Config API RH (rh_api.url, rh_api.key)
+-- database/migrations/  # Tables
```

---

## Commandes utiles

```bash
# Lancer l'environnement
cd backend && php artisan serve --host=0.0.0.0 --port=8080
cd frontend && npm run dev

# Ou avec Docker
docker-compose up -d

# Verifier TypeScript
cd frontend && npx tsc --noEmit

# Tests backend
cd backend && php artisan test
```

---

## Comptes de test
| Email | Mot de passe | Role |
|-------|--------------|------|
| admin@sand.local | password | Admin |
| marie.dupont@sand.local | password | Moderateur |
| jean.martin@sand.local | password | Utilisateur |
