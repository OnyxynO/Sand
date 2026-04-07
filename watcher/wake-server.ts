/**
 * sand-watcher — serveur de réveil du backend SAND
 *
 * Ecoute sur localhost:8082 et expose un endpoint GET /wake
 * protégé par le header X-Wake-Token.
 *
 * Variables d'environnement (configurées dans le service systemd) :
 *   WAKE_PORT         Port d'écoute (défaut : 8082)
 *   WAKE_TOKEN        Token secret obligatoire
 *   COMPOSE_FILE      Chemin vers docker-compose.yml (défaut : /var/www/sand/docker-compose.yml)
 *   COMPOSE_PROD_FILE Chemin vers docker-compose.prod.yml (défaut : /var/www/sand/docker-compose.prod.yml)
 */

const PORT = parseInt(process.env.WAKE_PORT ?? '8082');
const WAKE_TOKEN = process.env.WAKE_TOKEN ?? '';
const COMPOSE_FILE = process.env.COMPOSE_FILE ?? '/var/www/sand/docker-compose.yml';
const COMPOSE_PROD_FILE = process.env.COMPOSE_PROD_FILE ?? '/var/www/sand/docker-compose.prod.yml';

if (!WAKE_TOKEN) {
  console.error('[sand-watcher] ERREUR : WAKE_TOKEN non défini. Arrêt.');
  process.exit(1);
}

Bun.serve({
  port: PORT,
  hostname: '127.0.0.1',

  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname !== '/wake') {
      return new Response('Not Found', { status: 404 });
    }

    const token = req.headers.get('X-Wake-Token');
    if (token !== WAKE_TOKEN) {
      console.warn(`[sand-watcher] Token invalide depuis ${req.headers.get('x-forwarded-for') ?? 'inconnu'}`);
      return new Response('Unauthorized', { status: 401 });
    }

    console.log(`[sand-watcher] Réveil demandé — lancement de docker compose up -d`);

    // docker compose up -d est rapide (démarre les containers en arrière-plan)
    const proc = Bun.spawnSync([
      'docker', 'compose',
      '-f', COMPOSE_FILE,
      '-f', COMPOSE_PROD_FILE,
      'up', '-d',
    ], { stderr: 'pipe' });

    if (proc.exitCode !== 0) {
      const stderr = proc.stderr ? new TextDecoder().decode(proc.stderr) : '';
      console.error(`[sand-watcher] Echec docker compose : ${stderr}`);
      return new Response(
        JSON.stringify({ ok: false, erreur: 'docker compose a échoué' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    console.log('[sand-watcher] docker compose up -d OK');
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  },
});

console.log(`[sand-watcher] Ecoute sur 127.0.0.1:${PORT}`);
