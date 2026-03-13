import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import type { Utilisateur } from '../../../types';
import { ME_QUERY } from '../../../graphql/operations/auth';
import { useAuthStore } from '../../../stores/authStore';
import { API_BASE } from '../lib/api';

export function useAuthSessionBootstrap() {
  const [csrfPret, setCsrfPret] = useState(false);
  const { setUtilisateur, setChargement } = useAuthStore();

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

    if (error || !data?.me) {
      setChargement(false);
      return;
    }

    setUtilisateur(data.me);
  }, [csrfPret, data, error, loading, setChargement, setUtilisateur]);
}
