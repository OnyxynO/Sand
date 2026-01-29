# Bugs a corriger

## Login - espaces non trimmes
- **Fichier** : `frontend/src/pages/LoginPage.tsx`
- **Probleme** : Les espaces en fin d'email/mot de passe ne sont pas supprimes avant envoi
- **Impact** : Erreur de connexion si l'utilisateur copie-colle avec des espaces
- **Correction tentee** : Ajout de `.trim()` dans `handleSubmit` mais le hot reload ne semble pas fonctionner
- **Action** : Verifier que le code est bien applique apres rebuild complet
