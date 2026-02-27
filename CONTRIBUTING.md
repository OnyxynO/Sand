# Contribuer à SAND

## Prérequis

Voir le [README](README.md) pour l'installation de l'environnement de développement.

## Workflow de branches

```
main          — branche principale, toujours stable
feature/xxx   — nouvelle fonctionnalité
fix/xxx       — correction de bug
docs/xxx      — documentation uniquement
refactor/xxx  — refactoring sans changement fonctionnel
```

Créer une branche depuis `main`, soumettre une Pull Request vers `main`.

## Conventions de commit

Format [Conventional Commits](https://www.conventionalcommits.org/) en français :

```
feat: ajouter l'export PDF des rapports
fix: corriger le calcul des ETP sur les semaines courtes
docs: mettre à jour la section installation du README
refactor: extraire la logique de validation dans un service
test: ajouter les tests de la mutation exporterDonnees
```

Types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Avant de soumettre une PR

```bash
# Tests backend
docker compose exec app php artisan test

# Tests frontend
docker compose exec frontend npm run test:run

# Linting
docker compose exec app ./vendor/bin/pint
docker compose exec frontend npm run lint

# Analyse statique
docker compose exec app ./vendor/bin/phpstan analyse
```

## Après modification du schéma GraphQL

```bash
docker compose exec app php artisan lighthouse:clear-cache
docker compose exec frontend npm run generate
```
