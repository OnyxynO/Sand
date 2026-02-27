# Déploiement en production — SAND

Checklist des variables et configurations à modifier avant de passer en production.

---

## Variables `.env` obligatoires à changer

### Application

```bash
APP_ENV=production
APP_DEBUG=false           # NE PAS laisser true — expose les stack traces
APP_URL=https://votre-domaine.com
APP_KEY=                  # Générer avec : php artisan key:generate
```

### Base de données

```bash
DB_HOST=db
DB_DATABASE=sand
DB_USERNAME=sand
DB_PASSWORD=<mot_de_passe_fort>   # Changer le mot de passe par défaut
```

### Redis

```bash
REDIS_PASSWORD=<mot_de_passe_fort>   # Requis en production
CACHE_STORE=redis
QUEUE_CONNECTION=redis               # Activer le worker en prod (sync = pas d'async)
```

### Sessions

```bash
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true           # Requiert HTTPS
SESSION_ENCRYPT=true                 # Chiffre les données de session en base
                                     # Note : invalide les sessions existantes au déploiement
```

### Sécurité GraphQL

```bash
LIGHTHOUSE_SECURITY_DISABLE_INTROSPECTION=true   # Masque le schéma aux attaquants
```

### CORS

```bash
FRONTEND_URL=https://votre-domaine.com   # Origine autorisée pour les requêtes cross-origin
```

### Mail (mot de passe oublié)

```bash
MAIL_MAILER=smtp
MAIL_HOST=votre-smtp.com
MAIL_PORT=587
MAIL_USERNAME=votre@email.com
MAIL_PASSWORD=<mot_de_passe_smtp>
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME="SAND"
```

---

## Configuration Docker à ajuster

### Ports DB/Redis

En production, ne pas exposer les ports PostgreSQL (5432) et Redis (6379) sur l'hôte.
Le fichier `docker-compose.override.yml` (dev uniquement) expose ces ports — **ne pas déployer ce fichier en prod**.

### HTTPS / Nginx

Configurer un certificat TLS (Let's Encrypt recommandé) et décommenter le header HSTS dans `docker/nginx/conf.d/app.conf` :

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## Workers (exports CSV asynchrones)

Si `QUEUE_CONNECTION=redis`, lancer le worker Laravel :

```bash
docker compose exec app php artisan queue:work --sleep=3 --tries=3
```

Ou configurer un superviseur pour maintenir le worker en vie.

---

## Commandes de déploiement

```bash
# Mise en maintenance
docker compose exec app php artisan down

# Migrations
docker compose exec app php artisan migrate --force

# Cache
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
docker compose exec app php artisan lighthouse:clear-cache

# Retour en ligne
docker compose exec app php artisan up
```

---

## Checklist finale

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] Mot de passe DB fort
- [ ] Mot de passe Redis défini
- [ ] `SESSION_ENCRYPT=true`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `LIGHTHOUSE_SECURITY_DISABLE_INTROSPECTION=true`
- [ ] `FRONTEND_URL` configuré
- [ ] HTTPS actif + header HSTS activé
- [ ] Ports DB/Redis non exposés
- [ ] Worker queue lancé (si exports CSV nécessaires)
- [ ] Backups BDD configurés

---

*Créé le 2026-02-27 — Référence : AUDIT_SECURITE.md*
