# Journal de déploiement production — SAND

## Informations serveur

| Champ | Valeur |
|-------|--------|
| Fournisseur | Hetzner Cloud |
| Serveur | CX23 — 2 vCPU, 3.7 Go RAM, 38 Go SSD |
| OS | Ubuntu 24.04.3 LTS (Noble Numbat) |
| Datacenter | Nuremberg (nbg1) |
| IP | `<IP_VPS>` (voir secrets GitHub / Hetzner console) |
| Docker | 29.2.1 |
| Docker Compose | v5.1.0 |
| Date premier déploiement | 2026-02-27 |

## Architecture production

Un seul nginx (port 80) sert tout :
- `location /` → fichiers statiques React (`/usr/share/nginx/html`) + fallback SPA
- `location ~ ^/(api|sanctum|graphiql)` → PHP-FPM (Laravel) via FastCGI
- `location = /graphql` → PHP-FPM + rate limiting (300r/m, burst 10)

Le service Vite dev (`frontend`) et le mock API RH (`mock-rh`) sont désactivés via `profiles: [dev]`.

## Fichiers d'infrastructure prod

```
docker-compose.prod.yml           # Overlay prod (merge avec docker-compose.yml)
docker/nginx/Dockerfile.prod      # Multi-stage : node:20-alpine build → nginx:alpine serve
docker/nginx/prod/app.conf        # Config nginx prod (SPA + FastCGI + rate limiting)
frontend/.env.production          # VITE_API_URL=/graphql (même origine, zéro CORS)
frontend/package.json             # Script "build:docker" : vite build seul (sans codegen)
```

## Procédure de déploiement initial (VPS vierge)

```bash
# 1. Installer Docker
curl -fsSL https://get.docker.com | sh

# 2. Cloner le repo
git clone https://github.com/OnyxynO/Sand.git /var/www/sand
cd /var/www/sand

# 3. Configurer le backend
cp backend/.env.example backend/.env
# Editer backend/.env :
#   APP_ENV=production
#   APP_DEBUG=false
#   APP_KEY=base64:$(openssl rand -base64 32)
#   APP_URL=http://<IP_VPS>
#   DB_PASSWORD=<mot_de_passe_fort>
#   LOG_LEVEL=error
#   QUEUE_CONNECTION=redis
#   REDIS_PASSWORD=<mot_de_passe_fort>
#   SESSION_ENCRYPT=true
#   SESSION_SECURE_COOKIE=true          # Requiert HTTPS
#   SANCTUM_STATEFUL_DOMAINS=<IP_VPS>
#   FRONTEND_URL=http://<IP_VPS>
#   LIGHTHOUSE_SECURITY_DISABLE_INTROSPECTION=true

# 4. Créer le .env racine Docker Compose (CRITIQUE — voir piège #1)
echo "DB_PASSWORD=<meme_valeur_que_backend/.env>" > .env

# 5. Corriger les permissions backend (voir piège #3)
chown -R 1000:1000 /var/www/sand/backend/

# 6. Build et démarrage
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 7. Installer les dépendances PHP (vendor/ est gitignore)
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app \
  composer install --no-dev --optimize-autoloader

# 8. Migrations et seeds
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app \
  php artisan migrate --force
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app \
  php artisan db:seed --force
```

## Procédure de mise à jour

```bash
cd /var/www/sand
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
# Si nouvelles migrations :
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app \
  php artisan migrate --force
# Vider les caches Laravel (si changements de config/routes) :
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app \
  php artisan config:cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app \
  php artisan route:cache
```

## Vérifications post-déploiement

```bash
# React SPA
curl -s http://<IP_VPS>/ | grep '<title>'
# → <title>SAND</title>

# API health (database + redis)
curl -s http://<IP_VPS>/api/health
# → {"status":"ok","service":"sand-backend","checks":{"database":"ok","redis":"ok"}}

# GraphQL
curl -s -X POST http://<IP_VPS>/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'
# → {"data":{"__typename":"Query"}}

# Etat des containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

---

## Pièges rencontrés et solutions

### Piège 1 — `.env` racine Docker Compose vs `backend/.env`

**Symptôme** : `FATAL: password authentication failed for user "sand"` au démarrage de l'app Laravel.

**Cause** : Docker Compose lit les variables d'environnement (`${DB_PASSWORD:-secret}`) depuis le `.env` à la **racine du projet** (`/var/www/sand/.env`), pas depuis `backend/.env`. PostgreSQL s'initialise avec le mot de passe du `.env` racine. Si ce fichier n'existe pas, il utilise la valeur par défaut `secret`. Laravel lit lui `backend/.env` qui avait un mot de passe différent → mismatch.

**Solution** : Créer `/var/www/sand/.env` avec `DB_PASSWORD=<même valeur que backend/.env>`. Si la DB est déjà initialisée avec le mauvais password, supprimer le volume et recréer :
```bash
docker compose -f ... stop db
docker compose -f ... rm -f db
docker volume rm sand_sand-db-data
docker compose -f ... up -d db
```

---

### Piège 2 — `vendor/` absent après git clone

**Symptôme** : `Warning: require(/var/www/html/vendor/autoload.php): Failed to open stream` → queue worker crashe en boucle.

**Cause** : `vendor/` est gitignored. Le container `queue` (et `app`) ne peut pas démarrer artisan sans les dépendances Composer.

**Solution** : Après le premier `docker compose up`, lancer manuellement :
```bash
docker compose -f ... exec app composer install --no-dev --optimize-autoloader
```
Puis redémarrer le worker : `docker compose -f ... restart queue`.

---

### Piège 3 — Permissions `backend/` owned root

**Symptôme** : `vendor does not exist and could not be created` lors du `composer install`.

**Cause** : Le clone git crée `backend/` avec `root:root`. Le container PHP tourne en user `sand` (UID 1000) qui n'a pas les droits d'écriture.

**Solution** :
```bash
chown -R 1000:1000 /var/www/sand/backend/
```

---

### Piège 4 — Codegen Lighthouse échoue hors HTTP

**Symptôme** : `Error: Unknown type "Team"` / `Cannot query field "paginatorInfo" on type "User"` lors du `npm run build` dans le Dockerfile.

**Cause** : Le codegen `graphql-codegen` lisait le schema SDL brut (`backend/graphql/**/*.graphql`). Or, Lighthouse génère des types virtuels à l'introspection (`@paginate` → `UserPaginator` avec `data` + `paginatorInfo`, etc.) qui n'existent **pas** dans les fichiers SDL. Ces types ne sont disponibles que via HTTP `/graphql`.

**Solution** : Sauter le codegen dans le build Docker. Les fichiers `src/gql/` sont commités dans le repo. Ajout du script `build:docker` dans `package.json` :
```json
"build:docker": "vite build"
```
Le Dockerfile utilise `npm run build:docker` au lieu de `npm run build`.

> Note : `npm run build` (dev) continue de lancer codegen via HTTP comme avant.

---

### Piège 5 — Double conf nginx (`app.conf` + `app.prod.conf`)

**Symptôme** : nginx crashe en boucle avec `limit_req_zone "graphql" is already bound to key "$rate_limit_key"`.

**Cause** : Le compose de base monte `./docker/nginx/conf.d:/etc/nginx/conf.d`. Ce dossier contient `app.conf` (dev) et `app.prod.conf` (prod). En prod, nginx chargeait les **deux** fichiers, et les deux déclaraient `limit_req_zone graphql` → conflit.

**Solution** : Déplacer la config prod dans un dossier séparé : `docker/nginx/prod/app.conf`. Ce dossier n'est jamais monté en dev. Le `Dockerfile.prod` copie depuis ce chemin :
```dockerfile
COPY docker/nginx/prod/app.conf /etc/nginx/conf.d/app.conf
```

---

### Piège 6 — `!reset` non fonctionnel pour les ports (Docker Compose v5)

**Symptôme** : Port 80 non publié sur le host (`"80/tcp": null` dans `docker inspect`) malgré `ports: !reset - "80:80"` dans `docker-compose.prod.yml`.

**Cause** : La syntaxe `!reset` pour les ports ne fonctionne pas comme attendu avec Docker Compose v5.1.0. Le résultat était un tableau vide → aucun port publié.

**Solution** : Remplacer `ports: !reset` par un merge standard `ports: - "80:80"`. Les deux ports 8080 et 80 sont publiés (8080 hérité du compose base, 80 ajouté par le prod). Port 8080 fermable via firewall si besoin.

> Note : `volumes: []` dans le prod override ne remet pas non plus les volumes à zéro (comportement merge). Les volumes dev (`./backend:/var/www/html`, `./docker/nginx/conf.d:/etc/nginx/conf.d`) restent montés — c'est acceptable en prod car nginx ne les utilise pas (tout est dans l'image).

---

### Piège 7 — SSH Claude Code bloqué (sandbox)

**Symptôme** : Première tentative SSH retournait les infos de la machine locale (`whoami` → `seb`, `hostname` → `mbRm3ds.local`).

**Cause** : Le sandbox Claude Code interceptait la commande SSH et la réacheminait localement. Comportement intermittent — le SSH a fonctionné normalement dès la deuxième tentative.

**Workaround** : Relancer la commande SSH. Si bloqué définitivement, passer par un terminal local.

---

### Piège 8 — Clé SSH GitHub Actions corrompue par copier-coller

**Symptôme** : `ssh: no key found` — le secret `VPS_SSH_KEY` est présent dans GitHub mais non parseable par `appleboy/ssh-action`.

**Cause** : La clé privée Ed25519 affichée dans le terminal ou dans le chat a ses sauts de ligne reformatés lors du copier-coller dans l'interface GitHub Secrets → la clé est invalide.

**Solution** : Utiliser `gh secret set` directement depuis le fichier pour éviter tout reformatage :
```bash
gh secret set VPS_SSH_KEY --repo OnyxynO/Sand < /tmp/sand_deploy_key
```

---

## CI/CD — GitHub Actions

Mis en place le 2026-02-27. Fichier : `.github/workflows/ci-cd.yml`

### Architecture du pipeline

3 jobs enchaînés (le déploiement n'est déclenché que si les deux suites de tests passent) :

| Job | Outil | Déclencheur |
|-----|-------|-------------|
| `tests-backend` | PHPUnit + PostgreSQL 16 | push + PR sur main |
| `tests-frontend` | Vitest | push + PR sur main |
| `deploy` | SSH → VPS | push sur main uniquement |

### Secrets GitHub requis

| Secret | Valeur |
|--------|--------|
| `VPS_HOST` | `<IP_VPS>` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Clé privée Ed25519 (voir ci-dessous) |

### Clé de déploiement SSH

Générée localement puis ajoutée au VPS :
```bash
# Génération
ssh-keygen -t ed25519 -C "github-actions-deploy-sand" -f /tmp/sand_deploy_key -N ""

# Ajout au VPS
ssh-copy-id -i /tmp/sand_deploy_key.pub root@<IP_VPS>

# Ajout dans GitHub (sans copier-coller pour éviter la corruption)
gh secret set VPS_SSH_KEY --repo OnyxynO/Sand < /tmp/sand_deploy_key
```

### Particularités CI backend

Le runner GitHub Actions n'est pas Docker — la base PostgreSQL tourne en *service* GitHub Actions. Deux ajustements nécessaires :

```bash
# 1. Activer ltree (non activée par défaut dans l'image postgres:16-alpine)
PGPASSWORD=secret psql -h 127.0.0.1 -U sand -d sand_test -c "CREATE EXTENSION IF NOT EXISTS ltree;"

# 2. Patcher phpunit.xml : DB_HOST=db (Docker) → 127.0.0.1 (CI)
sed -i 's|<env name="DB_HOST" value="db"/>|<env name="DB_HOST" value="127.0.0.1"/>|' phpunit.xml
```

> Note : `DB_HOST` défini en step-level `env:` ne suffit pas — `phpunit.xml` avec force=false (défaut PHPUnit 11) ne l'écrase pas si la variable est déjà dans l'environnement. Le `sed` est plus fiable.

### Script de déploiement (SSH)

```bash
set -e
cd /var/www/sand
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T app \
  php artisan migrate --force
```

### Durée d'un run complet

~1min20 (tests-backend : ~1min, tests-frontend : ~30s, deploy : ~20s — parallèles).

---

## Prochaines étapes

- [ ] HTTPS : domaine + Certbot (Let's Encrypt) + nginx HTTPS
- [x] GitHub Actions : CI/CD auto sur push main (tests + deploy SSH) — 2026-02-27
- [ ] Fermer le port 8080 avec ufw (seul le port 80 est nécessaire en prod)
- [ ] Configurer les backups PostgreSQL automatiques
