import { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useAuthStore } from '../stores/authStore';
import { ME_QUERY } from '../graphql/operations/auth';
import type { Utilisateur } from '../types';

export function useAuthInit() {
  const { setUtilisateur, setChargement } = useAuthStore();

  const { data, loading, error } = useQuery<{ me: Utilisateur | null }>(ME_QUERY, {
    // Toujours aller chercher sur le serveur (auth via cookie Sanctum)
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (loading) {
      return;
    }

    // Si erreur ou pas d'utilisateur, marquer comme non connecte
    if (error || !data?.me) {
      setChargement(false);
      return;
    }

    // Utilisateur trouve, mettre a jour le store
    setUtilisateur(data.me);
  }, [data, loading, error, setUtilisateur, setChargement]);
}
