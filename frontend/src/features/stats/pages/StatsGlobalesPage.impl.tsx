import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { STATS_GLOBALES, STATS_PERIODE_PRECEDENTE } from '../../../graphql/operations/statistics';
import { TEAMS_FULL_QUERY } from '../../../graphql/operations/teams';
import SelecteurPeriode from '../../../components/dashboard/SelecteurPeriode';
import GraphiqueRepartitionProjets from '../../../components/dashboard/GraphiqueRepartitionProjets';
import GraphiqueActivites from '../../../components/dashboard/GraphiqueActivites';
import GraphiqueUtilisateurs from '../../../components/dashboard/GraphiqueUtilisateurs';
import GraphiqueEvolution from '../../../components/dashboard/GraphiqueEvolution';
import { SqueletteCarte, SqueletteGraphique } from '../../../components/Squelette';
import { periodeInitiale, periodePrecedente } from '../../../hooks/usePeriode';

interface Equipe {
  id: string;
  nom: string;
  code: string;
}

interface UtilisateurStat {
  utilisateur: { id: string; nomComplet: string };
  tempsTotal: number;
  tauxCompletion: number;
}

interface StatistiquesGlobales {
  tempsTotal: number;
  parProjet: Array<{
    projet: { id: string; nom: string; code: string };
    tempsTotal: number;
    pourcentage: number;
  }>;
  parActivite: Array<{
    activite: { id: string; nom: string };
    tempsTotal: number;
    pourcentage: number;
  }>;
  parUtilisateur: UtilisateurStat[];
  parJour: Array<{
    date: string;
    tempsTotal: number;
    estComplet: boolean;
  }>;
}

interface StatistiquesPeriodePrecedente {
  tempsTotal: number;
  parUtilisateur: UtilisateurStat[];
}

interface EquipesQueryData {
  equipes: Equipe[];
}

interface StatsGlobalesQueryData {
  statistiques: StatistiquesGlobales;
}

interface StatsPeriodePrecedenteQueryData {
  statistiques: StatistiquesPeriodePrecedente;
}

function formatDelta(actuel: number, precedent: number): { texte: string; positif: boolean | null } {
  if (precedent === 0) return { texte: '', positif: null };
  const delta = ((actuel - precedent) / precedent) * 100;
  const signe = delta >= 0 ? '+' : '';
  return { texte: `${signe}${delta.toFixed(0)}%`, positif: delta >= 0 };
}

export default function StatsGlobalesPage() {
  const initial = useMemo(() => periodeInitiale(), []);
  const [dateDebut, setDateDebut] = useState(initial.debut);
  const [dateFin, setDateFin] = useState(initial.fin);
  const [equipeId, setEquipeId] = useState<string>('');

  // Charger les equipes
  const { data: dataEquipes } = useQuery<EquipesQueryData>(TEAMS_FULL_QUERY, {
    variables: { actifSeulement: true },
    fetchPolicy: 'cache-and-network',
  });
  const equipes = dataEquipes?.equipes ?? [];

  // Variables communes
  const variables = {
    dateDebut,
    dateFin,
    ...(equipeId ? { equipeId } : {}),
  };

  // Stats periode courante
  const { data, loading, error } = useQuery<StatsGlobalesQueryData>(STATS_GLOBALES, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const stats = data?.statistiques;

  // Stats periode precedente (pour comparatif)
  const { debutPrec, finPrec } = useMemo(
    () => periodePrecedente(dateDebut),
    [dateDebut],
  );
  const { data: dataPrec } = useQuery<StatsPeriodePrecedenteQueryData>(STATS_PERIODE_PRECEDENTE, {
    variables: {
      dateDebut: debutPrec,
      dateFin: finPrec,
      ...(equipeId ? { equipeId } : {}),
    },
    fetchPolicy: 'cache-and-network',
  });
  const statsPrec = dataPrec?.statistiques;

  const nbContributeurs = stats?.parUtilisateur?.length ?? 0;
  const nbContributeursPrec = statsPrec?.parUtilisateur?.length ?? 0;

  const tauxCompletionMoyen = useMemo(() => {
    if (!stats?.parUtilisateur || stats.parUtilisateur.length === 0) return 0;
    const somme = stats.parUtilisateur.reduce(
      (acc: number, u: { tauxCompletion: number }) => acc + u.tauxCompletion,
      0,
    );
    return Math.round(somme / stats.parUtilisateur.length);
  }, [stats]);

  const tauxCompletionMoyenPrec = useMemo(() => {
    if (!statsPrec?.parUtilisateur || statsPrec.parUtilisateur.length === 0) return 0;
    const somme = statsPrec.parUtilisateur.reduce(
      (acc: number, u: { tauxCompletion: number }) => acc + u.tauxCompletion,
      0,
    );
    return Math.round(somme / statsPrec.parUtilisateur.length);
  }, [statsPrec]);

  // Deltas comparatifs
  const deltaTemps = statsPrec ? formatDelta(stats?.tempsTotal ?? 0, statsPrec.tempsTotal) : null;
  const deltaContributeurs = statsPrec ? formatDelta(nbContributeurs, nbContributeursPrec) : null;
  const deltaCompletion = statsPrec ? formatDelta(tauxCompletionMoyen, tauxCompletionMoyenPrec) : null;

  const handleChangePeriode = (debut: string, fin: string) => {
    setDateDebut(debut);
    setDateFin(fin);
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques globales</h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de l'activite de l'organisation
        </p>
      </div>

      {/* Filtre equipe */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <label htmlFor="equipe-select" className="block text-sm font-medium text-gray-700 mb-2">
          Equipe
        </label>
        <select
          id="equipe-select"
          value={equipeId}
          onChange={(e) => setEquipeId(e.target.value)}
          className="block w-full max-w-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        >
          <option value="">Toutes les equipes</option>
          {equipes.map((e: { id: string; nom: string; code: string }) => (
            <option key={e.id} value={e.id}>
              {e.code} - {e.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Selecteur de periode */}
      <SelecteurPeriode
        dateDebut={dateDebut}
        dateFin={dateFin}
        onChangePeriode={handleChangePeriode}
      />

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Erreur lors du chargement des statistiques : {error.message}
        </div>
      )}

      {/* Squelette (premier chargement) */}
      {loading && !stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SqueletteCarte /><SqueletteCarte /><SqueletteCarte />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SqueletteGraphique /><SqueletteGraphique />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SqueletteGraphique /><SqueletteGraphique />
          </div>
        </>
      )}

      {/* Contenu */}
      {stats && (
        <>
          {/* Cartes resume avec comparatif */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CarteResumeComparatif
              icone={<ClockIcon className="w-6 h-6" />}
              valeur={`${stats.tempsTotal.toFixed(1)} j`}
              label="Temps total (ETP)"
              couleurIcone="text-blue-600 bg-blue-100"
              delta={deltaTemps}
            />
            <CarteResumeComparatif
              icone={<UsersIcon className="w-6 h-6" />}
              valeur={String(nbContributeurs)}
              label="Contributeurs"
              couleurIcone="text-purple-600 bg-purple-100"
              delta={deltaContributeurs}
            />
            <CarteResumeComparatif
              icone={<CheckCircleIcon className="w-6 h-6" />}
              valeur={`${tauxCompletionMoyen}%`}
              label="Taux completion moyen"
              couleurIcone="text-green-600 bg-green-100"
              delta={deltaCompletion}
            />
          </div>

          {/* Graphiques ligne 1 : projets + activites */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraphiqueRepartitionProjets donnees={stats.parProjet} />
            <GraphiqueActivites donnees={stats.parActivite} />
          </div>

          {/* Graphiques ligne 2 : utilisateurs + evolution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraphiqueUtilisateurs donnees={stats.parUtilisateur} />
            <GraphiqueEvolution donnees={stats.parJour} />
          </div>
        </>
      )}
    </div>
  );
}

// Carte resume avec indicateur de tendance
interface CarteResumeComparatifProps {
  icone: React.ReactNode;
  valeur: string;
  label: string;
  couleurIcone?: string;
  delta: { texte: string; positif: boolean | null } | null;
}

function CarteResumeComparatif({ icone, valeur, label, couleurIcone = 'text-blue-600 bg-blue-100', delta }: CarteResumeComparatifProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${couleurIcone}`}>
        {icone}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-gray-900">{valeur}</p>
          {delta && delta.texte && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
              delta.positif ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
            }`}>
              {delta.positif ? (
                <ArrowTrendingUpIcon className="w-3 h-3" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3" />
              )}
              {delta.texte}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
