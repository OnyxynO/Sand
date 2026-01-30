# Notes de reprise - Session suivante

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

### Prochaines etapes possibles

1. **Implementer US-2.6 backend** :
   - Creer `SetActivityVisibilityMutator.php`
   - Ajouter mutation dans `graphql/mutations/project.graphql`
   - Puis creer l'UI frontend

2. **Passer a la Phase 3** (Integrations & Moderation) :
   - US-3.1 : Mock service RH
   - US-3.2 : Import des absences
   - US-3.3 : Gestion des conflits absences
   - US-3.4 : Droits moderateur
   - US-3.5 : Page de supervision
   - US-3.6 : Systeme de notifications

3. **Corriger les bugs** (voir TODO_BUGS.md) :
   - BUG-001 : Trim login
   - BUG-002 : Hot reload Vite

---

## Fichiers cles a connaitre

### Frontend
```
frontend/src/
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── SaisiePage.tsx
│   ├── ProjetsPage.tsx
│   └── admin/
│       ├── UtilisateursPage.tsx
│       ├── EquipesPage.tsx
│       └── ActivitesPage.tsx
├── components/
│   ├── saisie/           # Composants grille saisie
│   ├── admin/            # FormulaireUtilisateur
│   └── ui/               # ToastAnnulation
├── graphql/operations/   # Queries et mutations
├── stores/               # Zustand (authStore, saisieStore)
├── hooks/                # useAuthInit, useSaisieHebdo
└── utils/                # semaineUtils
```

### Backend
```
backend/
├── app/GraphQL/          # Resolvers
├── graphql/              # Schema GraphQL (types/, inputs/, mutations/)
├── app/Models/           # Eloquent
└── database/migrations/  # Tables
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
