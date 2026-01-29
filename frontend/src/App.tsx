import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuthInit';
import { useAuthStore } from './stores/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

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

        {/* Placeholder pour les futures pages */}
        <Route path="/saisie" element={<PlaceholderPage titre="Saisie hebdomadaire" />} />
        <Route path="/projets" element={<PlaceholderPage titre="Gestion des projets" />} />
        <Route path="/admin" element={<PlaceholderPage titre="Administration" />} />
      </Route>

      {/* Redirection par defaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Page placeholder pour les routes non implementees
function PlaceholderPage({ titre }: { titre: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{titre}</h1>
      <p className="text-gray-600">Cette page sera implementee prochainement.</p>
    </div>
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
