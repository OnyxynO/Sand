# Bugs et problemes a corriger

## BUG-001 : Login - espaces non trimmes
- **Fichier** : `frontend/src/pages/LoginPage.tsx`
- **Probleme** : Les espaces en fin d'email/mot de passe ne sont pas supprimes avant envoi
- **Impact** : Erreur de connexion si l'utilisateur copie-colle avec des espaces
- **Correction tentee** : Ajout de `.trim()` dans `handleSubmit` mais le hot reload ne semble pas fonctionner
- **Action** : Verifier que le code est bien applique apres rebuild complet
- **Ref** : DIFFUSION_LOG.md

## BUG-002 : Hot reload Vite intermittent
- **Contexte** : Le HMR de Vite affiche "update" dans la console mais le navigateur garde l'ancien code
- **Impact** : Necessite parfois un refresh manuel ou restart du serveur
- **Workaround** : Relancer `npm run dev` si les changements ne s'appliquent pas
- **Piste** : Peut etre lie a la config Docker ou au cache navigateur

---

## Problemes resolus

### RESOLU : Apollo Client 4.x imports
- **Probleme** : `Module '@apollo/client' has no exported member 'useQuery'`
- **Solution** : Importer depuis `@apollo/client/react` au lieu de `@apollo/client`

### RESOLU : Apollo Client 4.x useLazyQuery
- **Probleme** : `onCompleted`/`onError` n'existent plus dans les options de useLazyQuery
- **Solution** : Utiliser useEffect pour reagir aux changements de data/error

### RESOLU : CORS ports 5174-5175
- **Probleme** : Vite change parfois de port si 5173 est occupe
- **Solution** : Ajouter 5174, 5175 dans `backend/config/cors.php` et `SANCTUM_STATEFUL_DOMAINS`

---

## BUG-003 : CRUD Activites - mutations GraphQL non fonctionnelles
- **Page** : `/admin/activites` (ActivitesPage.tsx)
- **Probleme** : Les mutations GraphQL pour la gestion des activites retournent des erreurs
- **Details** :
  - Creation : Internal server error (apres correction du format input)
  - Modification : A tester
  - Suppression : A tester
  - Deplacement (monter/descendre) : A tester
- **Cause probable** : Incoherence entre le schema GraphQL backend et les mutations frontend
- **Fichiers concernes** :
  - `frontend/src/graphql/operations/activities.ts`
  - `backend/graphql/mutations/activity.graphql`
  - `backend/app/GraphQL/Mutations/ActivityMutator.php`
- **Action** : Debugger le backend (logs Laravel) pour identifier l'erreur exacte

---

## A implementer (hors bugs)

### Tests automatiques coherence front/back
- **Objectif** : Detecter automatiquement les incoherences entre les mutations GraphQL frontend et le schema backend
- **Idees** :
  - Script de validation du schema GraphQL au build
  - Tests d'integration qui appellent chaque mutation avec des donnees de test
  - Utiliser `graphql-codegen` pour generer les types TypeScript depuis le schema backend
- **Priorite** : Moyenne (qualite long terme)

### US-2.6 : Visibilite par utilisateur
- **Statut** : Backend non implemente
- **Table** : `activity_user_visibilities` existe
- **Manque** : Resolvers GraphQL pour `setActivityVisibility`
- **Frontend** : A creer une fois le backend pret

### US-3.3 : Interface resolution conflits absences
- **Statut** : Backend OK (resolveConflict dans AbsenceMutator), UI a creer
- **Backend** : `AbsenceMutator::resolveConflict()` avec actions garder_saisie/garder_absence
- **Notifications** : TYPE_CONFLIT_ABSENCE creees avec absence_id et saisie_ids
- **Manque** : Interface frontend pour afficher et resoudre les conflits

### US-3.6 : Systeme de notifications (UI)
- **Statut** : Backend OK (model Notification, types definis), UI a creer
- **Manque** :
  - Icone cloche dans le header
  - Badge compteur non lues
  - Panneau lateral listant les notifications
  - Marquage lu/non lu
