# Roadmap — Connexion rapide par rôle (mode démo)

Objectif : permettre à un visiteur de se connecter en un clic en tant qu'Admin, Modérateur ou Utilisateur,
sans saisir d'email/mot de passe. Activable/désactivable depuis les paramètres admin.
Conçu pour les instances de démonstration publique.

## Architecture cible

### Données

Deux clés dans la table `settings` existante :

| Clé | Type | Exemple |
|-----|------|---------|
| `connexion_rapide_activee` | boolean | `true` |
| `connexion_rapide_roles` | JSON | `{"admin": 3, "moderateur": 7, "utilisateur": 12}` |

`null` pour un rôle = non configuré (bouton absent sur la page login).

### Endpoints publics (sans auth)

**`GET /api/config/publique`**
Retourne la config nécessaire à la page login sans authentification.
```json
{ "connexion_rapide": { "activee": true, "roles": ["admin", "moderateur"] } }
```
Jamais les user IDs dans la réponse — juste les rôles disponibles.

**`POST /api/login-rapide`**
```json
{ "role": "admin" }
```
Retrouve le user configuré pour ce rôle, crée la session Sanctum, répond comme un login normal.
Rate limiting : 10 req/min par IP (via `throttle` Laravel).

---

## Tâches

### Backend

- [ ] **1. Migrations/seeds** — ajouter les deux clés dans `settings` (valeurs par défaut : `activee=false`, `roles={}`)
- [ ] **2. `LoginRapideController`**
  - `GET /api/config/publique` — public, pas de middleware auth
  - `POST /api/login-rapide` — public, rate limit 10/min, vérifie que la feature est activée, retrouve le user, crée la session Sanctum
- [ ] **3. Routes** — ajouter dans `routes/api.php`, hors du groupe `auth:sanctum`
- [ ] **4. Rate limiting** — configurer dans `RouteServiceProvider` ou directement dans la route

### Frontend

- [ ] **5. Page login (`features/auth/`)** — si `connexion_rapide.activee`, afficher les boutons de rôle sous le formulaire classique. Appel à `/api/config/publique` au mount.
- [ ] **6. Admin → Configuration** — nouvelle section "Connexion rapide (démo)" :
  - Toggle activer/désactiver
  - Par rôle disponible (Admin, Modérateur, Utilisateur) : dropdown pour sélectionner l'utilisateur associé
- [ ] **7. Mutation GraphQL** — ou appel REST pour sauvegarder `connexion_rapide_activee` et `connexion_rapide_roles`

### Validation

- [ ] **8. Tests PHPUnit** — `LoginRapideControllerTest` : feature désactivée → 403, rôle non configuré → 422, login OK → session créée
- [ ] **9. Tester le flux complet** — activer la feature en admin, configurer les 3 rôles, vérifier login depuis un navigateur non authentifié

---

## Sécurité — points d'attention

> Ces notes sont à inclure en commentaires dans le code au moment de l'implémentation.

- **Accès public total** : tout visiteur ayant l'URL peut se connecter avec n'importe quel rôle configuré. Ne jamais activer sur une instance avec des vraies données.
- **Rate limiting insuffisant seul** : 10 req/min par IP ne protège pas contre des IPs rotatives. Sans WAF ou protection Cloudflare, la surface reste large.
- **Absence de CSRF obligatoire** : `/api/login-rapide` est public par définition, donc pas de token CSRF au sens strict. À documenter clairement.
- **Users de démo dédiés** : les users configurés pour la connexion rapide devraient contenir uniquement des données de démo non sensibles — idéalement les users du `DemoSeeder`.
- **Désactivation d'urgence** : prévoir la possibilité de désactiver la feature côté serveur (variable d'env `CONNEXION_RAPIDE_DISABLED=true`) indépendamment du setting BDD, en cas de besoin.
