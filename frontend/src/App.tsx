import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuthInit';
import { useAuthStore } from './stores/authStore';

// Pages (chargement paresseux)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SaisiePage = lazy(() => import('./pages/SaisiePage'));
const SupervisionPage = lazy(() => import('./pages/SupervisionPage'));
const StatsProjetPage = lazy(() => import('./pages/StatsProjetPage'));
const StatsGlobalesPage = lazy(() => import('./pages/StatsGlobalesPage'));
const ExportPage = lazy(() => import('./pages/ExportPage'));
const UtilisateursPage = lazy(() => import('./pages/admin/UtilisateursPage'));
const EquipesPage = lazy(() => import('./pages/admin/EquipesPage'));
const ActivitesPage = lazy(() => import('./pages/admin/ActivitesPage'));
const ConfigurationPage = lazy(() => import('./pages/admin/ConfigurationPage'));
const ProjetsPage = lazy(() => import('./pages/ProjetsPage'));

// Composants (shell app - import statique)
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  // Initialiser l'auth au demarrage
  useAuthInit();

  const { estConnecte, chargement } = useAuthStore();

  // Afficher un loader pendant l'initialisation
  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Route de login */}
        <Route
          path="/login"
          element={estConnecte ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Routes protegees */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />

          {/* Page de saisie */}
          <Route path="/saisie" element={<SaisiePage />} />

          {/* Administration */}
          <Route path="/admin" element={<Navigate to="/admin/utilisateurs" replace />} />
          <Route path="/admin/utilisateurs" element={<UtilisateursPage />} />
          <Route path="/admin/equipes" element={<EquipesPage />} />
          <Route path="/admin/activites" element={<ActivitesPage />} />
          <Route path="/admin/configuration" element={<ConfigurationPage />} />

          {/* Projets */}
          <Route path="/projets" element={<ProjetsPage />} />

          {/* Supervision (moderateurs/admin) */}
          <Route path="/supervision" element={<SupervisionPage />} />

          {/* Stats projet (moderateurs/admin) */}
          <Route path="/stats-projet" element={<StatsProjetPage />} />

          {/* Stats globales (admin) */}
          <Route path="/stats-globales" element={<StatsGlobalesPage />} />

          {/* Export CSV (admin) */}
          <Route path="/export" element={<ExportPage />} />
        </Route>

        {/* Redirection par defaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
