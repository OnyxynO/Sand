import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { estConnecte, chargement, utilisateur } = useAuthStore();

  // Afficher un loader pendant la verification
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

  // Rediriger vers login si non connecte
  if (!estConnecte) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifier les roles si specifie
  if (roles && roles.length > 0 && utilisateur) {
    if (!roles.includes(utilisateur.role)) {
      // Rediriger vers le dashboard si pas le bon role
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
