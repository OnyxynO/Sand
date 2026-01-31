# Bugs et problemes a corriger

## Bugs actifs

### BUG-002 : Hot reload Vite intermittent
- **Contexte** : Le HMR de Vite affiche "update" dans la console mais le navigateur garde l'ancien code
- **Impact** : Necessite parfois un refresh manuel ou restart du serveur
- **Workaround** : Relancer `npm run dev` ou Ctrl+Shift+R si les changements ne s'appliquent pas
- **Piste** : Peut etre lie a la config Docker ou au cache navigateur
- **Priorite** : Basse (workaround disponible)

---

## Problemes resolus

### RESOLU : BUG-001 - Login espaces non trimmes
- **Probleme** : Les espaces en fin d'email/mot de passe n'etaient pas supprimes
- **Solution** : Ajout de `.trim()` dans `handleSubmit` (LoginPage.tsx lignes 35-36)
- **Statut** : Corrige et verifie

### RESOLU : Apollo Client 4.x imports
- **Probleme** : `Module '@apollo/client' has no exported member 'useQuery'`
- **Solution** : Importer depuis `@apollo/client/react` au lieu de `@apollo/client`

### RESOLU : Apollo Client 4.x useLazyQuery
- **Probleme** : `onCompleted`/`onError` n'existent plus dans les options de useLazyQuery
- **Solution** : Utiliser useEffect pour reagir aux changements de data/error

### RESOLU : CORS ports 5174-5175
- **Probleme** : Vite change parfois de port si 5173 est occupe
- **Solution** : Ajouter 5174, 5175 dans `backend/config/cors.php` et `SANCTUM_STATEFUL_DOMAINS`

### RESOLU : BUG-003 - CRUD Activites mutations GraphQL
- **Probleme** : Incoherence entre mutations frontend et schema backend (input objects)
- **Solution** : Aligner `CREATE_ACTIVITY` et `UPDATE_ACTIVITY` avec le format `input: CreateActivityInput!`
- **Commit** : `1ebe2fd`

---

## Fonctionnalites implementees (anciennement "A implementer")

### US-2.6 : Visibilite par utilisateur ✅
- **Commit** : `702387a`
- **Backend** : Modele ActivityUserVisibility, mutations hideActivityForUser/showActivityForUser
- **Frontend** : Modale GestionVisibilitesModal dans page Projets

### US-3.3 : Interface resolution conflits absences ✅
- **Commit** : `686c1e5`
- **Backend** : resolveAbsenceConflict avec resolution ECRASER/IGNORER
- **Frontend** : ConflitResolutionModal avec confirmation pour actions destructives

### US-3.6 : Systeme de notifications (UI) ✅
- **Commit** : `686c1e5`
- **Frontend** : NotificationBell, NotificationPanel, NotificationItem
- **Store** : notificationStore.ts avec Zustand

---

## A implementer (hors bugs)

### Tests automatiques coherence front/back
- **Objectif** : Detecter automatiquement les incoherences entre les mutations GraphQL frontend et le schema backend
- **Idees** :
  - Script de validation du schema GraphQL au build
  - Tests d'integration qui appellent chaque mutation avec des donnees de test
  - Utiliser `graphql-codegen` pour generer les types TypeScript depuis le schema backend
- **Priorite** : Moyenne (qualite long terme)

### RESOLU : Erreur codegen TypedDocumentNode
- **Probleme** : `src/gql/gql.ts` et `src/gql/graphql.ts` avaient une erreur d'import TypedDocumentNode
- **Message** : `'TypedDocumentNode' is a type and must be imported using a type-only import`
- **Cause** : verbatimModuleSyntax dans tsconfig exige `import type`
- **Solution** : Ajouter `useTypeImports: true` dans codegen.ts
