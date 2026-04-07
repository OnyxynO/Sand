import { useState, useEffect, useRef } from 'react';

export type StatutService = 'ok' | 'erreur' | 'verification';

export interface EtatService {
  nom: string;
  statut: StatutService;
}

const INTERVALLE_MS = 3000;
const MAX_TENTATIVES = 10; // ~30s avant de déclencher le réveil automatique

const DELAI_INITIAL_APRES_REVEIL_MS = 10000; // Attendre que Docker démarre
const INTERVALLE_APRES_REVEIL_MS = 5000;
const MAX_TENTATIVES_APRES_REVEIL = 12; // ~70s max après réveil

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql').replace('/graphql', '');
const URL_HEALTH = `${BASE_URL}/api/health`;
const URL_WAKE = `${BASE_URL}/api/wake`;
const WAKE_TOKEN = import.meta.env.VITE_WAKE_TOKEN ?? '';

const SERVICES_VERIFICATION: EtatService[] = [
  { nom: 'API Backend', statut: 'verification' },
  { nom: 'Base de données', statut: 'verification' },
  { nom: 'Redis / Files d\'attente', statut: 'verification' },
];

const SERVICES_ERREUR: EtatService[] = [
  { nom: 'API Backend', statut: 'erreur' },
  { nom: 'Base de données', statut: 'erreur' },
  { nom: 'Redis / Files d\'attente', statut: 'erreur' },
];

export interface EtatSante {
  services: EtatService[];
  tousOk: boolean;
  premierCheckFait: boolean;
  reveilEnCours: boolean; // Réveil déclenché, on attend que Docker démarre
  echec: boolean;         // Toujours en échec après le réveil — afficher "Réessayer"
  relancer: () => void;
}

export function useServiceHealth(): EtatSante {
  const [services, setServices] = useState<EtatService[]>(SERVICES_VERIFICATION);
  const [premierCheckFait, setPremierCheckFait] = useState(false);
  const [reveilEnCours, setReveilEnCours] = useState(false);
  const [echec, setEchec] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tentativesRef = useRef(0);

  async function verifier(): Promise<boolean> {
    try {
      const reponse = await fetch(URL_HEALTH, { signal: AbortSignal.timeout(4000) });

      if (!reponse.ok) {
        setServices(SERVICES_ERREUR);
        return false;
      }

      const data = await reponse.json();
      const checks = data?.checks ?? {};
      const dbOk = checks.database === 'ok';
      const redisOk = checks.redis === 'ok';

      setServices([
        { nom: 'API Backend', statut: 'ok' },
        { nom: 'Base de données', statut: dbOk ? 'ok' : 'erreur' },
        { nom: 'Redis / Files d\'attente', statut: redisOk ? 'ok' : 'erreur' },
      ]);

      return dbOk && redisOk;
    } catch {
      setServices(SERVICES_ERREUR);
      return false;
    } finally {
      setPremierCheckFait(true);
    }
  }

  async function tenterReveil() {
    setReveilEnCours(true);
    setServices(SERVICES_VERIFICATION);

    // Appeler /api/wake si un token est configuré (prod uniquement)
    if (WAKE_TOKEN) {
      try {
        await fetch(URL_WAKE, {
          headers: { 'X-Wake-Token': WAKE_TOKEN },
          signal: AbortSignal.timeout(10000),
        });
      } catch {
        // Continuer même si le wake échoue — Docker peut déjà être en train de démarrer
      }
    }

    // Attendre que les containers aient le temps de démarrer
    await new Promise<void>((resolve) => {
      timerRef.current = setTimeout(resolve, DELAI_INITIAL_APRES_REVEIL_MS);
    });

    tentativesRef.current = 0;

    async function iterationPostReveil() {
      const ok = await verifier();
      if (ok) {
        setReveilEnCours(false);
        return;
      }

      tentativesRef.current += 1;
      if (tentativesRef.current >= MAX_TENTATIVES_APRES_REVEIL) {
        setReveilEnCours(false);
        setEchec(true);
        return;
      }

      timerRef.current = setTimeout(iterationPostReveil, INTERVALLE_APRES_REVEIL_MS);
    }

    iterationPostReveil();
  }

  function demarrerPolling() {
    if (timerRef.current) clearTimeout(timerRef.current);
    tentativesRef.current = 0;
    setReveilEnCours(false);
    setEchec(false);
    setServices(SERVICES_VERIFICATION);
    setPremierCheckFait(false);

    async function iteration() {
      const ok = await verifier();
      if (ok) return;

      tentativesRef.current += 1;
      if (tentativesRef.current >= MAX_TENTATIVES) {
        // Déclencher le réveil automatiquement
        tenterReveil();
        return;
      }

      timerRef.current = setTimeout(iteration, INTERVALLE_MS);
    }

    iteration();
  }

  useEffect(() => {
    demarrerPolling();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const tousOk = services.every((s) => s.statut === 'ok');

  return { services, tousOk, premierCheckFait, reveilEnCours, echec, relancer: demarrerPolling };
}
