import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import type { UserRole, Utilisateur } from '../../../types';

export interface EtatConnexionRapide {
  activee: boolean;
  roles: string[];
  chargement: boolean;
  erreurLogin: string;
  loginEnCours: boolean;
  loginRapide: (role: string) => Promise<void>;
}

interface ConfigPublique {
  connexion_rapide: {
    activee: boolean;
    roles: string[];
  };
}

interface ReponseLoginRapide {
  user: {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    role: string;
  };
}

/** Convertit la réponse REST (id number, role minuscule) en Utilisateur du store */
function normaliserUser(raw: ReponseLoginRapide['user']): Utilisateur {
  return {
    id: String(raw.id),
    nom: raw.nom,
    prenom: raw.prenom,
    email: raw.email,
    role: raw.role.toUpperCase() as UserRole,
  };
}

export function useConnexionRapide(
  onSuccess: (user: Utilisateur) => void,
): EtatConnexionRapide {
  const [activee, setActivee] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreurLogin, setErreurLogin] = useState('');
  const [loginEnCours, setLoginEnCours] = useState(false);

  useEffect(() => {
    let annule = false;

    async function chargerConfig() {
      try {
        const reponse = await fetch(`${API_BASE}/api/config/publique`, {
          signal: AbortSignal.timeout(5000),
        });

        if (!reponse.ok) {
          // Comportement dégradé silencieux : page login normale sans les boutons
          return;
        }

        const data: ConfigPublique = await reponse.json();

        if (!annule) {
          setActivee(data.connexion_rapide.activee);
          setRoles(data.connexion_rapide.roles);
        }
      } catch {
        // Erreur réseau ou timeout : comportement dégradé silencieux
        // La page login classique reste opérationnelle
      } finally {
        if (!annule) setChargement(false);
      }
    }

    chargerConfig();
    return () => { annule = true; };
  }, []);

  async function loginRapide(role: string): Promise<void> {
    setErreurLogin('');
    setLoginEnCours(true);

    try {
      // Récupérer le cookie CSRF avant le POST (requis par Sanctum)
      await fetch(`${API_BASE}/sanctum/csrf-cookie`, { credentials: 'include' });

      const reponse = await fetch(`${API_BASE}/api/login-rapide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ role }),
        signal: AbortSignal.timeout(10000),
      });

      const data: ReponseLoginRapide & { message?: string } = await reponse.json();

      if (!reponse.ok) {
        setErreurLogin(data.message ?? 'Connexion rapide impossible.');
        return;
      }

      onSuccess(normaliserUser(data.user));
    } catch {
      setErreurLogin('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoginEnCours(false);
    }
  }

  return { activee, roles, chargement, erreurLogin, loginEnCours, loginRapide };
}
