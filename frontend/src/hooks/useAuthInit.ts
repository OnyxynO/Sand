import { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useAuthStore } from '../stores/authStore';
import { ME_QUERY } from '../graphql/operations/auth';
import type { Utilisateur } from '../types';

export function useAuthInit() {
  const { setUtilisateur, setChargement, hasToken, deconnecter } = useAuthStore();

  const { data, loading, error } = useQuery<{ me: Utilisateur | null }>(ME_QUERY, {
    // Ne pas executer si pas de token
    skip: !hasToken(),
    // Toujours aller chercher sur le serveur
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    // Si pas de token, pas besoin de verifier
    if (!hasToken()) {
      setChargement(false);
      return;
    }

    // Attendre la fin du chargement
    if (loading) {
      return;
    }

    // Si erreur ou pas d'utilisateur, deconnecter
    if (error || !data?.me) {
      deconnecter();
      return;
    }

    // Utilisateur trouve, mettre a jour le store
    setUtilisateur(data.me);
  }, [data, loading, error, hasToken, setUtilisateur, setChargement, deconnecter]);
}
