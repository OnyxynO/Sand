import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
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
const RgpdPage = lazy(() => import('./pages/admin/RgpdPage'));
const ProjetsPage = lazy(() => import('./pages/ProjetsPage'));

// Composants (shell app - import statique)
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}

// Layout racine : initialise l'auth et enveloppe toutes les routes
function RootLayout() {
  useAuthInit();
  const { chargement } = useAuthStore();

  if (chargement) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
}

// Route de login : redirige vers / si deja connecte
function LoginRoute() {
  const { estConnecte } = useAuthStore();
  return estConnecte ? <Navigate to="/" replace /> : <LoginPage />;
}

// Layout protege : verifie l'auth puis affiche Layout avec Outlet
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  {
    // Route racine sans path : s'applique a toutes les routes (init auth)
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginRoute /> },

      {
        // Layout protege sans path : enveloppe toutes les routes applicatives
        element: <ProtectedLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/saisie', element: <SaisiePage /> },
          { path: '/stats-projet', element: <StatsProjetPage /> },

          // Routes moderateur + admin uniquement
          {
            element: <ProtectedRoute roles={['MODERATEUR', 'ADMIN']}><Outlet /></ProtectedRoute>,
            children: [
              { path: '/projets', element: <ProjetsPage /> },
              { path: '/supervision', element: <SupervisionPage /> },
            ],
          },

          // Routes admin uniquement
          {
            element: <ProtectedRoute roles={['ADMIN']}><Outlet /></ProtectedRoute>,
            children: [
              { path: '/admin', element: <Navigate to="/admin/utilisateurs" replace /> },
              { path: '/admin/utilisateurs', element: <UtilisateursPage /> },
              { path: '/admin/equipes', element: <EquipesPage /> },
              { path: '/admin/activites', element: <ActivitesPage /> },
              { path: '/admin/configuration', element: <ConfigurationPage /> },
              { path: '/admin/rgpd', element: <RgpdPage /> },
              { path: '/stats-globales', element: <StatsGlobalesPage /> },
              { path: '/export', element: <ExportPage /> },
            ],
          },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
