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

## A implementer (hors bugs)

### US-2.6 : Visibilite par utilisateur
- **Statut** : Backend non implemente
- **Table** : `activity_user_visibilities` existe
- **Manque** : Resolvers GraphQL pour `setActivityVisibility`
- **Frontend** : A creer une fois le backend pret
