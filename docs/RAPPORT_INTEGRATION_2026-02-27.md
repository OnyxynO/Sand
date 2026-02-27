# Rapport d'intégration — SAND

**Machine** : macOS 26.3 / M4 / non-dev
**Date** : 2026-02-27
**Méthode** : Installation from scratch, analyse statique complète du projet

---

## Historique des sessions de test

| Session | Contexte | Résultat |
|---------|----------|----------|
| Test 1 | Docker absent — machine vierge | ❌ Bloqué à l'étape 1 |
| Test 2 | Docker 29.2.1 installé via Homebrew | ✅ Installation réussie avec 1 bug rencontré (P9) |

---

## Test 1 — Résultat : INSTALLATION BLOQUÉE

Docker absent sur la machine. Le script s'arrête dès l'étape 1.

```
=== Installation SAND ===
1. Vérification des prérequis
✗ Docker n'est pas installé. Voir https://docs.docker.com/get-docker/
```

---

## Inventaire des outils présents / manquants

| Outil | Présent | Requis par | Critique |
|-------|---------|-----------|----------|
| Docker Desktop | ❌ | install.sh, tout | **BLOQUANT** |
| Node.js / npm | ❌ | Playwright E2E, CLAUDE.md | Partiel |
| PHP | ❌ | — (dans Docker) | Non |
| Composer | ❌ | — (dans Docker) | Non |
| wget | ❌ | Healthcheck nginx Docker | Non (interne) |
| git | ✅ 2.50.1 | clone | — |
| curl | ✅ | tests manuels | — |
| jq | ✅ | scripts de débogage | — |
| Homebrew | ✅ 5.0.15 | installation Docker | — |
| gh CLI | ✅ | clone du repo | — |

**Bonne nouvelle** : Homebrew est disponible, Docker Desktop peut être installé via `brew install --cask docker`.

---

## Test 2 — Résultat : INSTALLATION RÉUSSIE

Docker 29.2.1 + Compose v5.0.2 installés via `brew install --cask docker`. L'installation s'est déroulée jusqu'au bout. Un bug a été rencontré en phase de vérification post-install (P9).

**Vérification des services après installation :**

| Service | URL | Statut |
|---------|-----|--------|
| Frontend React | http://localhost:5173 | ✅ 200 |
| Backend Laravel | http://localhost:8080/api/health | ✅ 200 (après correction manuelle) |
| GraphiQL | http://localhost:8080/graphiql | ✅ 200 |
| Mock API RH | http://localhost:3001/api/health | ✅ 200 |

---

## Problèmes identifiés

### P1 — BLOQUANT : Docker absent, pas de commande d'installation proposée

Le script détecte l'absence et renvoie vers une URL. Sur macOS avec Homebrew disponible, il pourrait proposer :
```bash
brew install --cask docker
```
L'utilisateur est bloqué sans solution immédiate.

**Impact** : 100% bloquant, rien ne peut démarrer.

---

### P2 — MAJEUR : Incohérence `docker-compose` vs `docker compose` entre les scripts

`scripts/install.sh` gère correctement les deux syntaxes (v1 et v2) avec un fallback automatique.

`start-dev.sh` utilise **exclusivement** `docker-compose` (v1, trait d'union) :
```bash
# start-dev.sh ligne 19
docker-compose up -d db redis
```

Docker Desktop moderne (v4+) n'inclut plus `docker-compose` en standalone — seul `docker compose` (v2, plugin) est disponible. **`start-dev.sh` échouerait** sur une installation récente de Docker, alors que `install.sh` fonctionnerait.

---

### P3 — MAJEUR : `.env.example` racine obsolète et incohérent

Il existe **deux `.env.example`** :
- `backend/.env.example` — celui utilisé par `install.sh`, très bien documenté ✅
- `.env.example` à la racine — non utilisé par le script, contient des valeurs différentes :

| Variable | root `.env.example` | `backend/.env.example` |
|----------|--------------------|-----------------------|
| `SESSION_DRIVER` | `redis` | `file` |
| `QUEUE_CONNECTION` | `redis` | `sync` |
| `CACHE_DRIVER` | `redis` | *(variable nommée `CACHE_STORE`)* |

Un développeur qui copie le mauvais fichier obtiendra une configuration incohérente. `CACHE_STORE` vs `CACHE_DRIVER` sont deux noms différents pour la même fonctionnalité — selon la version de Laravel utilisée, l'une ou l'autre peut ne pas être reconnue.

---

### P4 — MOYEN : Aucune version Node.js requise documentée ou vérifiée

Le README précise *"Node.js — uniquement pour les tests E2E Playwright"* mais :
- Aucune version minimale n'est mentionnée (Playwright 1.x requiert Node ≥ 18)
- `frontend/package.json` n'a **pas de champ `engines`** — contrainte de version Node absente
- Le script `install.sh` ne vérifie pas Node même en mode `--demo`

Un développeur qui installe Node 16 (LTS précédent encore répandu) obtiendra une erreur cryptique de Playwright, pas un message clair.

---

### P5 — MOYEN : `CLAUDE.md` projet utilise la syntaxe dépréciée `docker-compose`

Toutes les commandes de la section *"Commandes essentielles"* du `CLAUDE.md` utilisent `docker-compose` (v1) :
```bash
docker-compose up -d
docker-compose exec app php artisan test
```
C'est cohérent avec `start-dev.sh` mais inconsistant avec `install.sh` et potentiellement cassé sur les nouveaux Docker Desktop.

---

### P6 — MINEUR : `APP_DEBUG=false` par défaut dans `.env.example`

```env
APP_DEBUG=false  # true en dev local, false en production
```

Le commentaire dit bien de le passer à `true` en dev local, mais le script d'install copie le fichier tel quel sans modifier cette valeur. Un développeur qui suit l'installation rapide (`bash scripts/install.sh`) aura `APP_DEBUG=false` et ne verra pas les stack traces Laravel en cas d'erreur. Difficile à diagnostiquer.

---

### P7 — MINEUR : `QUEUE_CONNECTION=sync` — export CSV silencieusement non-async

```env
QUEUE_CONNECTION=sync  # Mettre "redis" en production pour les exports async
```

Avec `sync`, les jobs s'exécutent de façon synchrone dans la requête HTTP. L'export CSV fonctionnera, mais sans le comportement asynchrone attendu (notification "export prêt"). Le service `queue` Docker tourne pour rien. L'utilisateur qui teste la fonctionnalité d'export verra un comportement différent du mode production sans comprendre pourquoi.

---

### P8 — MINEUR : Pas de vérification de disponibilité des ports avant démarrage

Les ports 5173, 8080, 5432, 6379, 3001 sont tous libres sur cette machine, mais le script ne les vérifie pas. Le README mentionne le conflit de noms de conteneurs mais pas les conflits de ports. Sur une machine de dev avec d'autres projets actifs (PostgreSQL local, autre frontend Vite...), les `docker compose up` échoueraient avec des messages d'erreur peu lisibles.

---

### P9 — MAJEUR : `APP_KEY` non générée malgré l'étape dédiée dans `install.sh`

**Découvert lors du test 2**, après installation complète en apparence réussie.

**Symptôme** : `http://localhost:8080/api/health` retourne 500. Log Laravel :
```
No application encryption key has been specified.
(Illuminate\Encryption\MissingAppKeyException)
```

**Cause racine** : le commentaire inline sur la ligne `APP_KEY=` dans `backend/.env.example` trompe la détection du script :

```env
APP_KEY=                          # Générer avec : php artisan key:generate
```

Le script fait :
```bash
CURRENT_KEY=$(grep '^APP_KEY=' backend/.env | cut -d'=' -f2)
if [[ -z "$CURRENT_KEY" ]]; then ...
```

`cut -d'=' -f2` retourne `<espaces># Générer avec : php artisan key:generate` — chaîne non vide → la condition `$CURRENT_KEY` est considérée comme définie → **la génération de clé est sautée**.

**Impact** : Toutes les routes qui utilisent les sessions/cookies (dont `/api/health`) retournent 500. Le GraphQL fonctionnait car il ne dépend pas des sessions dans cette config, masquant partiellement le problème.

**Correction appliquée manuellement** :
```bash
docker compose exec -T app php artisan key:generate
```

**Fix à apporter** : supprimer le commentaire inline de la ligne `APP_KEY=` dans `.env.example` (le commentaire peut rester sur la ligne précédente), ou utiliser `trim` dans le script pour ignorer les espaces et commentaires.

---

## Ce qui fonctionne bien

| Point | Note |
|-------|------|
| Script d'install structuré, coloré, avec feedback clair à chaque étape | ✅ |
| Gestion double syntaxe `docker compose` / `docker-compose` dans `install.sh` | ✅ |
| `backend/.env.example` très bien documenté avec commentaires prod/dev | ✅ |
| `composer.lock` + `package-lock.json` présents — install déterministe | ✅ |
| `docker-compose.override.yml` séparé pour les ports dev — bonne pratique | ✅ |
| Healthchecks sur tous les services Docker (db, redis, nginx, mock-rh) | ✅ |
| Ports DB et Redis non exposés par défaut — bonne posture sécurité | ✅ |
| Attente active PostgreSQL avec timeout (30 tentatives) | ✅ |
| Base `sand_test` créée automatiquement par le script | ✅ |
| Option `--demo` bien documentée et intégrée au script | ✅ |
| Le `README.md` couvre l'install manuelle si le script ne convient pas | ✅ |

---

## Recommandations par ordre de priorité

### Immédiat (bloquant / sécurité)

**1. Ajouter la proposition d'installation Docker via Homebrew :**
```bash
if ! command -v docker &>/dev/null; then
    if command -v brew &>/dev/null; then
        warn "Docker non trouvé. Pour installer : brew install --cask docker"
        warn "Puis lance Docker Desktop et relance ce script."
    fi
    fail "Docker n'est pas installé. Voir https://docs.docker.com/get-docker/"
fi
```

**2. Corriger `start-dev.sh`** pour utiliser `docker compose` (v2) ou ajouter le même fallback que `install.sh`.

**3. Supprimer ou corriger le `.env.example` racine** — soit le supprimer (il n'est pas utilisé), soit l'aligner sur `backend/.env.example`. Sa présence crée une confusion réelle.

### Court terme (qualité)

**4. Ajouter `"engines": { "node": ">=18" }` dans `frontend/package.json`** et vérifier Node dans `install.sh` si Playwright est dans le scope du setup.

**5. Uniformiser `docker-compose` → `docker compose` dans `CLAUDE.md`** et `start-dev.sh`.

**6. Passer `APP_DEBUG=true` dans `install.sh`** lors de la création du `.env`, ou documenter explicitement que c'est à faire manuellement.

### Optimisation (nice-to-have)

**7. Ajouter un check de ports** avant `docker compose up` :
```bash
for port in 5173 8080 3001; do
    lsof -i :$port &>/dev/null && warn "Port $port déjà utilisé — possible conflit"
done
```

**8. Passer `QUEUE_CONNECTION=redis` par défaut** dans le `.env.example` si le worker queue est toujours démarré — évite la confusion sur le comportement des exports.

**9. Supprimer le commentaire inline sur la ligne `APP_KEY=`** dans `backend/.env.example` :
```env
# Générer avec : php artisan key:generate
APP_KEY=
```
Ou améliorer la détection dans le script :
```bash
CURRENT_KEY=$(grep '^APP_KEY=' backend/.env | cut -d'=' -f2 | tr -d ' ' | cut -d'#' -f1)
```

---

## Verdict global

L'architecture et la qualité du projet sont solides. Avec Docker installé, l'installation se déroule jusqu'au bout. Cependant, **P9 est un bug silencieux** : le script annonce "Installation terminée avec succès" alors que l'application est partiellement cassée (500 sur les routes avec sessions). C'est le problème le plus trompeur de tous ceux identifiés.

Au total, 9 problèmes identifiés sur 2 sessions de test. Les plus critiques à corriger :
1. **P9** — bug réel d'install, l'app démarre cassée sans avertissement
2. **P2** — `start-dev.sh` échouerait sur Docker Desktop récent
3. **P3** — `.env.example` racine source de confusion
