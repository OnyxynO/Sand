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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervision</h1>
          <p className="text-sm text-gray-500">
            {anomalies.length} anomalie{anomalies.length > 1 ? 's' : ''} detectee{anomalies.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Navigation periode + Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={allerSemainePrecedente}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[180px] text-center">
              {labelPeriode}
            </span>
            <button
              onClick={allerSemaineSuivante}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setFiltresOuverts(!filtresOuverts)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border ${
              filtreProjet || filtreEquipe || filtreType
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'hover:bg-gray-50 text-gray-600'
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
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Projet</label>
              <select
                value={filtreProjet}
                onChange={(e) => setFiltreProjet(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Equipe</label>
                <select
                  value={filtreEquipe}
                  onChange={(e) => setFiltreEquipe(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
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
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Reinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des anomalies */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Erreur : {error.message}</div>
        ) : anomalies.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium">Aucune anomalie</p>
            <p className="text-sm text-gray-500 mt-1">Toutes les saisies sont correctes pour cette periode.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {anomaliesParUtilisateur.map(({ utilisateur, anomalies: userAnomalies }) => (
              <div key={utilisateur.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {utilisateur.nomComplet.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{utilisateur.nomComplet}</p>
                    <p className="text-xs text-gray-500">
                      {utilisateur.equipe?.nom || 'Sans equipe'} • {utilisateur.email}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {userAnomalies.length} anomalie{userAnomalies.length > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => voirSaisie(utilisateur.id, userAnomalies[0]?.date || undefined)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
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
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
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
                          <p className="text-sm text-gray-700 mt-1">{anomalie.detail}</p>
                          {anomalie.projet && (
                            <p className="text-xs text-gray-500 mt-1">
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
