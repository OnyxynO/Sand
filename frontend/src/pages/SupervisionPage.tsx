// Page de supervision des anomalies (Moderateur/Admin)

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  FunnelIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns';
import { dateVersSemaineISO } from '../utils/semaineUtils';
import { fr } from 'date-fns/locale';
import { ANOMALIES_QUERY } from '../graphql/operations/supervision';
import { PROJETS_QUERY } from '../graphql/operations/projects';
import { TEAMS_QUERY } from '../graphql/operations/users';
import { useAuthStore } from '../stores/authStore';

interface Anomalie {
  id: string;
  type: 'JOUR_INCOMPLET' | 'JOUR_DEPASSE' | 'SEMAINE_VIDE' | 'CONFLIT_ABSENCE' | 'JOUR_MANQUANT' | 'SAISIE_SUR_ABSENCE';
  date?: string;
  semaine?: string;
  detail: string;
  utilisateur: {
    id: string;
    nomComplet: string;
    email: string;
    equipe?: {
      id: string;
      nom: string;
    };
  };
  projet?: {
    id: string;
    nom: string;
    code: string;
  };
}

interface Projet {
  id: string;
  nom: string;
  code: string;
}

interface Equipe {
  id: string;
  nom: string;
  code: string;
}

const typeConfig: Record<string, { label: string; couleur: string; icone: typeof ClockIcon }> = {
  JOUR_INCOMPLET: {
    label: 'Jour incomplet',
    couleur: 'bg-orange-100 text-orange-800',
    icone: ClockIcon,
  },
  JOUR_DEPASSE: {
    label: 'Jour depasse',
    couleur: 'bg-red-100 text-red-800',
    icone: ExclamationTriangleIcon,
  },
  SEMAINE_VIDE: {
    label: 'Semaine vide',
    couleur: 'bg-gray-100 text-gray-800',
    icone: CalendarDaysIcon,
  },
  CONFLIT_ABSENCE: {
    label: 'Conflit absence',
    couleur: 'bg-amber-100 text-amber-800',
    icone: ExclamationTriangleIcon,
  },
  JOUR_MANQUANT: {
    label: 'Jour manquant',
    couleur: 'bg-yellow-100 text-yellow-800',
    icone: CalendarDaysIcon,
  },
  SAISIE_SUR_ABSENCE: {
    label: 'Saisie sur absence',
    couleur: 'bg-purple-100 text-purple-800',
    icone: ExclamationTriangleIcon,
  },
};


export default function SupervisionPage() {
  const { utilisateur } = useAuthStore();
  const estAdmin = utilisateur?.role === 'ADMIN';
  const navigate = useNavigate();

  // Periode par defaut : semaine courante
  const aujourdHui = new Date();
  const [dateDebut, setDateDebut] = useState(() =>
    format(startOfWeek(aujourdHui, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );
  const [dateFin, setDateFin] = useState(() =>
    format(endOfWeek(aujourdHui, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );

  // Filtres
  const [filtreProjet, setFiltreProjet] = useState<string>('');
  const [filtreEquipe, setFiltreEquipe] = useState<string>('');
  const [filtreType, setFiltreType] = useState<string>('');
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  // Queries
  interface AnomaliesData {
    anomalies: Anomalie[];
  }

  interface ProjetsData {
    projets: Projet[];
  }

  interface EquipesData {
    equipes: Equipe[];
  }

  const { data, loading, error } = useQuery<AnomaliesData>(ANOMALIES_QUERY, {
    variables: {
      dateDebut,
      dateFin,
      projetId: filtreProjet || undefined,
      equipeId: filtreEquipe || undefined,
      types: filtreType ? [filtreType] : undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: dataProjets } = useQuery<ProjetsData>(PROJETS_QUERY, {
    variables: { actif: true },
  });

  const { data: dataEquipes } = useQuery<EquipesData>(TEAMS_QUERY, {
    variables: { actifSeulement: true },
    skip: !estAdmin, // Seul admin peut filtrer par equipe
  });

  const anomalies = data?.anomalies || [];
  const projets = dataProjets?.projets || [];
  const equipes = dataEquipes?.equipes || [];

  // Grouper par utilisateur
  const anomaliesParUtilisateur = useMemo(() => {
    const grouped = new Map<string, { utilisateur: Anomalie['utilisateur']; anomalies: Anomalie[] }>();
    anomalies.forEach((a) => {
      const key = a.utilisateur.id;
      if (!grouped.has(key)) {
        grouped.set(key, { utilisateur: a.utilisateur, anomalies: [] });
      }
      grouped.get(key)!.anomalies.push(a);
    });
    return Array.from(grouped.values()).sort((a, b) =>
      a.utilisateur.nomComplet.localeCompare(b.utilisateur.nomComplet)
    );
  }, [anomalies]);

  // Navigation semaine
  const allerSemainePrecedente = () => {
    const debut = subWeeks(new Date(dateDebut), 1);
    setDateDebut(format(startOfWeek(debut, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setDateFin(format(endOfWeek(debut, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  const allerSemaineSuivante = () => {
    const debut = addWeeks(new Date(dateDebut), 1);
    setDateDebut(format(startOfWeek(debut, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setDateFin(format(endOfWeek(debut, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  // Navigation vers la page de saisie d'un utilisateur
  const voirSaisie = (userId: string, dateStr?: string) => {
    const semaine = dateVersSemaineISO(new Date(dateStr || dateDebut));
    navigate(`/saisie?userId=${userId}&semaine=${semaine}`);
  };

  const labelPeriode = useMemo(() => {
    const d = new Date(dateDebut);
    const f = new Date(dateFin);
    return `${format(d, 'd MMM', { locale: fr })} - ${format(f, 'd MMM yyyy', { locale: fr })}`;
  }, [dateDebut, dateFin]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sand-card flex items-center justify-between rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(52,78,65,0.08),rgba(238,154,104,0.14))] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">
            Moderation
          </p>
          <h1 className="font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">Supervision</h1>
          <p className="text-sm text-[color:var(--sand-muted)]">
            {anomalies.length} anomalie{anomalies.length > 1 ? 's' : ''} detectee{anomalies.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Navigation periode + Filtres */}
      <div className="sand-card rounded-[1.8rem] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={allerSemainePrecedente}
              className="rounded-full border border-[color:var(--sand-line)] bg-white/80 p-2 text-[color:var(--sand-muted)] transition hover:border-[color:var(--sand-accent)] hover:text-[color:var(--sand-ink)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="min-w-[180px] text-center text-sm font-medium text-[color:var(--sand-ink)]">
              {labelPeriode}
            </span>
            <button
              onClick={allerSemaineSuivante}
              className="rounded-full border border-[color:var(--sand-line)] bg-white/80 p-2 text-[color:var(--sand-muted)] transition hover:border-[color:var(--sand-accent)] hover:text-[color:var(--sand-ink)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setFiltresOuverts(!filtresOuverts)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              filtreProjet || filtreEquipe || filtreType
                ? 'border-[color:var(--sand-accent)]/40 bg-[color:var(--sand-accent)]/10 text-[color:var(--sand-accent-strong)]'
                : 'border-[color:var(--sand-line)] bg-white/75 text-[color:var(--sand-muted)] hover:border-[color:var(--sand-accent)]/35 hover:bg-white'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filtres
            {(filtreProjet || filtreEquipe || filtreType) && (
              <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">
                {[filtreProjet, filtreEquipe, filtreType].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Panneau filtres */}
        {filtresOuverts && (
          <div className="flex flex-wrap gap-4 border-t border-[color:var(--sand-line)] pt-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">Projet</label>
              <select
                value={filtreProjet}
                onChange={(e) => setFiltreProjet(e.target.value)}
                className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 text-sm text-[color:var(--sand-ink)]"
              >
                <option value="">Tous les projets</option>
                {projets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.nom}
                  </option>
                ))}
              </select>
            </div>

            {estAdmin && (
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">Equipe</label>
                <select
                  value={filtreEquipe}
                  onChange={(e) => setFiltreEquipe(e.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 text-sm text-[color:var(--sand-ink)]"
                >
                  <option value="">Toutes les equipes</option>
                  {equipes.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">Type</label>
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 text-sm text-[color:var(--sand-ink)]"
              >
                <option value="">Tous les types</option>
                {Object.entries(typeConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltreProjet('');
                  setFiltreEquipe('');
                  setFiltreType('');
                }}
                className="px-3 py-2 text-sm font-medium text-[color:var(--sand-muted)] transition hover:text-[color:var(--sand-ink)]"
              >
                Reinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des anomalies */}
      <div className="sand-card overflow-hidden rounded-[1.8rem]">
        {loading ? (
          <div className="p-8 text-center text-[color:var(--sand-muted)]">Chargement...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Erreur : {error.message}</div>
        ) : anomalies.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-[color:var(--sand-ink)]">Aucune anomalie</p>
            <p className="mt-1 text-sm text-[color:var(--sand-muted)]">Toutes les saisies sont correctes pour cette periode.</p>
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--sand-line)]">
            {anomaliesParUtilisateur.map(({ utilisateur, anomalies: userAnomalies }) => (
              <div key={utilisateur.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--sand-accent)]/15 font-medium text-[color:var(--sand-accent-strong)]">
                    {utilisateur.nomComplet.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[color:var(--sand-ink)]">{utilisateur.nomComplet}</p>
                    <p className="text-xs text-[color:var(--sand-muted)]">
                      {utilisateur.equipe?.nom || 'Sans equipe'} • {utilisateur.email}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm text-[color:var(--sand-muted)]">
                      {userAnomalies.length} anomalie{userAnomalies.length > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => voirSaisie(utilisateur.id, userAnomalies[0]?.date || undefined)}
                      className="flex items-center gap-1 rounded-full bg-[color:var(--sand-ink)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[color:var(--sand-accent-strong)]"
                      title="Voir la saisie de cet utilisateur"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      Voir saisie
                    </button>
                  </div>
                </div>

                <div className="ml-13 space-y-2">
                  {userAnomalies.map((anomalie) => {
                    const config = typeConfig[anomalie.type] || typeConfig.JOUR_INCOMPLET;
                    const IconComponent = config.icone;

                    return (
                      <div
                        key={anomalie.id}
                        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[color:var(--sand-line)] bg-white/75 p-3 transition hover:border-[color:var(--sand-accent)]/30 hover:bg-[color:var(--sand-surface-strong)]"
                        onClick={() => voirSaisie(utilisateur.id, anomalie.date || undefined)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            voirSaisie(utilisateur.id, anomalie.date || undefined);
                          }
                        }}
                      >
                        <div className={`p-1.5 rounded ${config.couleur}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.couleur}`}>
                              {config.label}
                            </span>
                            {anomalie.date && (
                              <span className="text-xs text-gray-500">
                                {format(new Date(anomalie.date), 'EEEE d MMMM', { locale: fr })}
                              </span>
                            )}
                            {anomalie.semaine && (
                              <span className="text-xs text-gray-500">Semaine {anomalie.semaine}</span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[color:var(--sand-muted)]">{anomalie.detail}</p>
                          {anomalie.projet && (
                            <p className="mt-1 text-xs text-[color:var(--sand-muted)]">
                              Projet : {anomalie.projet.code} - {anomalie.projet.nom}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
