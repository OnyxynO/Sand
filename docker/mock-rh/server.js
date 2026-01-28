/**
 * Mock API RH - Serveur de développement
 * Simule l'API RH externe pour les absences des collaborateurs
 */

const http = require('http');

const PORT = 3001;

// Données fictives d'absences
const absences = [
  {
    id: 1,
    matricule: 'EMP001',
    type: 'conges_payes',
    date_debut: '2024-12-23',
    date_fin: '2024-12-27',
    statut: 'valide'
  },
  {
    id: 2,
    matricule: 'EMP002',
    type: 'maladie',
    date_debut: '2024-12-20',
    date_fin: '2024-12-20',
    statut: 'valide'
  },
  {
    id: 3,
    matricule: 'EMP001',
    type: 'rtt',
    date_debut: '2024-12-30',
    date_fin: '2024-12-30',
    statut: 'valide'
  }
];

// Données fictives des employés
const employes = [
  { matricule: 'EMP001', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com' },
  { matricule: 'EMP002', nom: 'Martin', prenom: 'Marie', email: 'marie.martin@example.com' },
  { matricule: 'EMP003', nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@example.com' }
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

    res.writeHead(200);
    res.end(JSON.stringify({ data: result, total: result.length }));
    return;
  }

  // GET /api/employes - Liste des employés
  if (url.pathname === '/api/employes' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ data: employes, total: employes.length }));
    return;
  }

  // GET /api/health - Health check
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'mock-rh' }));
    return;
  }

  // 404 pour les autres routes
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route non trouvee' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API RH demarree sur http://localhost:${PORT}`);
  console.log('Routes disponibles:');
  console.log('  GET /api/health     - Health check');
  console.log('  GET /api/absences   - Liste des absences');
  console.log('  GET /api/employes   - Liste des employes');
});
