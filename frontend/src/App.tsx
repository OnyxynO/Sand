import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuthInit';
import { useAuthStore } from './stores/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SaisiePage from './pages/SaisiePage';
import SupervisionPage from './pages/SupervisionPage';
import StatsProjetPage from './pages/StatsProjetPage';
import UtilisateursPage from './pages/admin/UtilisateursPage';
import EquipesPage from './pages/admin/EquipesPage';
import ActivitesPage from './pages/admin/ActivitesPage';
import ProjetsPage from './pages/ProjetsPage';

// Composants
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

        {/* Projets */}
        <Route path="/projets" element={<ProjetsPage />} />

        {/* Supervision (moderateurs/admin) */}
        <Route path="/supervision" element={<SupervisionPage />} />

        {/* Stats projet (moderateurs/admin) */}
        <Route path="/stats-projet" element={<StatsProjetPage />} />
      </Route>

      {/* Redirection par defaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
