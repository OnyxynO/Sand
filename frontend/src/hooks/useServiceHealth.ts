import { useState, useEffect, useRef } from 'react';

export type StatutService = 'ok' | 'erreur' | 'verification';

export interface EtatService {
  nom: string;
  statut: StatutService;
}

export interface EtatSante {
  services: EtatService[];
  tousOk: boolean;
  premierCheckFait: boolean;
}

const INTERVALLE_MS = 3000;
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql').replace('/graphql', '');
const URL_HEALTH = `${BASE_URL}/api/health`;

export function useServiceHealth(): EtatSante {
  const [services, setServices] = useState<EtatService[]>([
    { nom: 'API Backend', statut: 'verification' },
    { nom: 'Base de données', statut: 'verification' },
    { nom: 'Redis / Files d\'attente', statut: 'verification' },
  ]);
  const [premierCheckFait, setPremierCheckFait] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function verifier() {
    try {
      const reponse = await fetch(URL_HEALTH, { signal: AbortSignal.timeout(4000) });

      if (!reponse.ok) {
        setServices([
          { nom: 'API Backend', statut: 'erreur' },
          { nom: 'Base de données', statut: 'erreur' },
          { nom: 'Redis / Files d\'attente', statut: 'erreur' },
        ]);
        return;
      }

      const data = await reponse.json();
      const checks = data?.checks ?? {};

      setServices([
        { nom: 'API Backend', statut: 'ok' },
        { nom: 'Base de données', statut: checks.database === 'ok' ? 'ok' : 'erreur' },
        { nom: 'Redis / Files d\'attente', statut: checks.redis === 'ok' ? 'ok' : 'erreur' },
      ]);
    } catch {
      setServices([
        { nom: 'API Backend', statut: 'erreur' },
        { nom: 'Base de données', statut: 'erreur' },
        { nom: 'Redis / Files d\'attente', statut: 'erreur' },
      ]);
    } finally {
      setPremierCheckFait(true);
    }
  }

  useEffect(() => {
    verifier();

    function planifierProchain() {
      timerRef.current = setTimeout(async () => {
        await verifier();
        planifierProchain();
      }, INTERVALLE_MS);
    }

    planifierProchain();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const tousOk = services.every((s) => s.statut === 'ok');

  return { services, tousOk, premierCheckFait };
}
