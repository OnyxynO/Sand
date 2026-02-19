import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useAuthStore } from '../stores/authStore';
import { ME_QUERY } from '../graphql/operations/auth';
import type { Utilisateur } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql').replace(
  '/graphql',
  '',
);

export function useAuthInit() {
  const [csrfPret, setCsrfPret] = useState(false);
  const { setUtilisateur, setChargement } = useAuthStore();

  // Initialiser le cookie CSRF avant toute requete GraphQL (requis par Sanctum SPA)
  useEffect(() => {
    fetch(`${API_BASE}/sanctum/csrf-cookie`, { credentials: 'include' }).finally(() =>
      setCsrfPret(true),
    );
  }, []);

  const { data, loading, error } = useQuery<{ me: Utilisateur | null }>(ME_QUERY, {
    skip: !csrfPret,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!csrfPret || loading) {
      return;
    }

    // Si erreur ou pas d'utilisateur, marquer comme non connecte
    if (error || !data?.me) {
      setChargement(false);
      return;
    }

    // Utilisateur trouve, mettre a jour le store
    setUtilisateur(data.me);
  }, [csrfPret, data, loading, error, setUtilisateur, setChargement]);
}
