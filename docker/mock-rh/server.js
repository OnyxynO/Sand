/**
 * Mock API RH - Serveur de developpement
 * Simule l'API RH externe pour les absences des collaborateurs
 *
 * Matricules alignes avec les seeders SAND :
 * - DEV001 (Jean Martin - utilisateur)
 * - DEV002 (Pierre Bernard - utilisateur)
 * - MOD001 (Marie Dupont - moderateur)
 */

const http = require('http');

const PORT = 3001;

// Donnees fictives d'absences - dates en fevrier/mars 2026 pour les tests
const absences = [
  // --- Jean Martin (DEV001) ---
  // Semaine 1-7 fev : RTT mercredi 4 fev
  {
    id: 17,
    matricule: 'DEV001',
    type: 'rtt',
    date_debut: '2026-02-04',
    date_fin: '2026-02-04',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  // Semaine 1-7 fev : demi-journee maladie vendredi 6 fev
  {
    id: 18,
    matricule: 'DEV001',
    type: 'maladie',
    date_debut: '2026-02-06',
    date_fin: '2026-02-06',
    duree_journaliere: 0.5,
    statut: 'valide'
  },
  // Semaine complete de conges (lun-ven)
  {
    id: 1,
    matricule: 'DEV001',
    type: 'conges_payes',
    date_debut: '2026-02-09',
    date_fin: '2026-02-13',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  // RTT un vendredi
  {
    id: 3,
    matricule: 'DEV001',
    type: 'rtt',
    date_debut: '2026-02-20',
    date_fin: '2026-02-20',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  // Demi-journee maladie (matin)
  {
    id: 6,
    matricule: 'DEV001',
    type: 'maladie',
    date_debut: '2026-02-25',
    date_fin: '2026-02-25',
    duree_journaliere: 0.5,
    statut: 'valide'
  },
  // Mercredis recurrents - RTT tous les mercredis de mars
  {
    id: 7,
    matricule: 'DEV001',
    type: 'rtt',
    date_debut: '2026-03-04',
    date_fin: '2026-03-04',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  {
    id: 8,
    matricule: 'DEV001',
    type: 'rtt',
    date_debut: '2026-03-11',
    date_fin: '2026-03-11',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  {
    id: 9,
    matricule: 'DEV001',
    type: 'rtt',
    date_debut: '2026-03-18',
    date_fin: '2026-03-18',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  {
    id: 10,
    matricule: 'DEV001',
    type: 'rtt',
    date_debut: '2026-03-25',
    date_fin: '2026-03-25',
    duree_journaliere: 1.0,
    statut: 'valide'
  },

  // --- Pierre Bernard (DEV002) ---
  // Semaine 1-7 fev : conges lundi-mardi 2-3 fev
  {
    id: 19,
    matricule: 'DEV002',
    type: 'conges_payes',
    date_debut: '2026-02-02',
    date_fin: '2026-02-03',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  // Maladie 1 jour
  {
    id: 2,
    matricule: 'DEV002',
    type: 'maladie',
    date_debut: '2026-02-16',
    date_fin: '2026-02-16',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  // Demi-journees de conges (jeu + ven apres-midi)
  {
    id: 5,
    matricule: 'DEV002',
    type: 'conges_payes',
    date_debut: '2026-02-26',
    date_fin: '2026-02-27',
    duree_journaliere: 0.5,
    statut: 'valide'
  },
  // Semaine complete conges mars
  {
    id: 11,
    matricule: 'DEV002',
    type: 'conges_payes',
    date_debut: '2026-03-09',
    date_fin: '2026-03-13',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  // Mercredis recurrents - absence partielle (demi-journee) tous les mercredis de mars
  {
    id: 12,
    matricule: 'DEV002',
    type: 'rtt',
    date_debut: '2026-03-04',
    date_fin: '2026-03-04',
    duree_journaliere: 0.5,
    statut: 'valide'
  },
  {
    id: 13,
    matricule: 'DEV002',
    type: 'rtt',
    date_debut: '2026-03-18',
    date_fin: '2026-03-18',
    duree_journaliere: 0.5,
    statut: 'valide'
  },
  {
    id: 14,
    matricule: 'DEV002',
    type: 'rtt',
    date_debut: '2026-03-25',
    date_fin: '2026-03-25',
    duree_journaliere: 0.5,
    statut: 'valide'
  },

  // --- Marie Dupont (MOD001) ---
  // Semaine 1-7 fev : demi-journee RTT mercredi 4 fev
  {
    id: 20,
    matricule: 'MOD001',
    type: 'rtt',
    date_debut: '2026-02-04',
    date_fin: '2026-02-04',
    duree_journaliere: 0.5,
    statut: 'valide'
  },
  // Formation 2 jours
  {
    id: 4,
    matricule: 'MOD001',
    type: 'formation',
    date_debut: '2026-02-23',
    date_fin: '2026-02-24',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  // Conges payes 3 jours (lun-mer)
  {
    id: 15,
    matricule: 'MOD001',
    type: 'conges_payes',
    date_debut: '2026-03-02',
    date_fin: '2026-03-04',
    duree_journaliere: 1.0,
    statut: 'valide'
  },
  // Demi-journee RTT un vendredi
  {
    id: 16,
    matricule: 'MOD001',
    type: 'rtt',
    date_debut: '2026-03-20',
    date_fin: '2026-03-20',
    duree_journaliere: 0.5,
    statut: 'valide'
  },
];

// Donnees fictives des employes - alignees avec les seeders SAND
const employes = [
  { matricule: 'DEV001', nom: 'Martin', prenom: 'Jean', email: 'jean.martin@sand.local' },
  { matricule: 'DEV002', nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@sand.local' },
  { matricule: 'MOD001', nom: 'Dupont', prenom: 'Marie', email: 'marie.dupont@sand.local' },
  { matricule: 'RH001', nom: 'Petit', prenom: 'Sophie', email: 'sophie.petit@sand.local' },
  { matricule: 'ADMIN001', nom: 'Admin', prenom: 'Super', email: 'admin@sand.local' }
];

const server = http.createServer((req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET /api/absences - Liste des absences (avec filtres optionnels)
  if (url.pathname === '/api/absences' && req.method === 'GET') {
    let result = [...absences];

    const matricule = url.searchParams.get('matricule');
    const dateDebut = url.searchParams.get('date_debut');
    const dateFin = url.searchParams.get('date_fin');

    if (matricule) {
      result = result.filter(a => a.matricule === matricule);
    }
    if (dateDebut) {
      result = result.filter(a => a.date_fin >= dateDebut);
    }
    if (dateFin) {
      result = result.filter(a => a.date_debut <= dateFin);
    }

    console.log(`[${new Date().toISOString()}] GET /api/absences - matricule=${matricule || '*'}, periode=${dateDebut || '*'} -> ${dateFin || '*'} - ${result.length} resultats`);

    res.writeHead(200);
    res.end(JSON.stringify({ data: result, total: result.length }));
    return;
  }

  // GET /api/employes - Liste des employes
  if (url.pathname === '/api/employes' && req.method === 'GET') {
    console.log(`[${new Date().toISOString()}] GET /api/employes - ${employes.length} resultats`);
    res.writeHead(200);
    res.end(JSON.stringify({ data: employes, total: employes.length }));
    return;
  }

  // GET /api/health - Health check
  if (url.pathname === '/api/health' && req.method === 'GET') {
    console.log(`[${new Date().toISOString()}] GET /api/health - OK`);
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'mock-rh' }));
    return;
  }

  // 404 pour les autres routes
  console.log(`[${new Date().toISOString()}] 404 - ${req.method} ${req.url}`);
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route non trouvee' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API RH demarree sur http://localhost:${PORT}`);
  console.log('Routes disponibles:');
  console.log('  GET /api/health     - Health check');
  console.log('  GET /api/absences   - Liste des absences');
  console.log('  GET /api/employes   - Liste des employes');
  console.log('');
  console.log('Matricules disponibles: DEV001, DEV002, MOD001, RH001, ADMIN001');
});
