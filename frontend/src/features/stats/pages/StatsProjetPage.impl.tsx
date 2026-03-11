import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { STATS_PROJET } from '../../../graphql/operations/statistics';
import { PROJETS_ACTIFS } from '../../../graphql/operations/saisie';
import SelecteurPeriode from '../../../components/dashboard/SelecteurPeriode';
import CarteResume from '../../../components/dashboard/CarteResume';
import GraphiqueActivites from '../../../components/dashboard/GraphiqueActivites';
import GraphiqueUtilisateurs from '../../../components/dashboard/GraphiqueUtilisateurs';
import GraphiqueEvolution from '../../../components/dashboard/GraphiqueEvolution';
import { SqueletteCarte, SqueletteGraphique } from '../../../components/Squelette';

interface Projet {
  id: string;
  nom: string;
  code: string;
}

interface UtilisateurStat {
  utilisateur: { id: string; nomComplet: string };
  tempsTotal: number;
  tauxCompletion: number;
}

interface StatistiquesProjet {
  tempsTotal: number;
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

interface ProjetsActifsQueryData {
  projets: Projet[];
}

interface StatsProjetQueryData {
  statistiques: StatistiquesProjet;
}

function dernierJourDuMois(annee: number, mois: number): number {
  return new Date(annee, mois + 1, 0).getDate();
}

function periodeInitiale() {
  const maintenant = new Date();
  const a = maintenant.getFullYear();
  const m = maintenant.getMonth();
  const debut = `${a}-${String(m + 1).padStart(2, '0')}-01`;
  const fin = `${a}-${String(m + 1).padStart(2, '0')}-${dernierJourDuMois(a, m)}`;
  return { debut, fin };
}

export default function StatsProjetPage() {
  const initial = useMemo(() => periodeInitiale(), []);
  const [dateDebut, setDateDebut] = useState(initial.debut);
  const [dateFin, setDateFin] = useState(initial.fin);
  const [projetId, setProjetId] = useState<string>('');

  // Charger la liste des projets
  const { data: dataProjets, loading: loadingProjets } = useQuery<ProjetsActifsQueryData>(PROJETS_ACTIFS, {
    fetchPolicy: 'cache-and-network',
  });

  // Selectionner le premier projet par defaut
  const projets = dataProjets?.projets ?? [];
  const projetSelectionne = projetId || projets[0]?.id || '';

  // Charger les stats du projet selectionne
  const { data, loading, error } = useQuery<StatsProjetQueryData>(STATS_PROJET, {
    variables: { dateDebut, dateFin, projetId: projetSelectionne },
    skip: !projetSelectionne,
    fetchPolicy: 'cache-and-network',
  });

  const stats = data?.statistiques;

  const nbContributeurs = stats?.parUtilisateur?.length ?? 0;

  const tauxCompletionMoyen = useMemo(() => {
    if (!stats?.parUtilisateur || stats.parUtilisateur.length === 0) return 0;
    const somme = stats.parUtilisateur.reduce(
      (acc: number, u: { tauxCompletion: number }) => acc + u.tauxCompletion,
      0,
    );
    return Math.round(somme / stats.parUtilisateur.length);
  }, [stats]);

  const handleChangePeriode = (debut: string, fin: string) => {
    setDateDebut(debut);
    setDateFin(fin);
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques projet</h1>
        <p className="text-gray-600 mt-1">
          Suivi de l'activite par projet
        </p>
      </div>

      {/* Selecteur de projet */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <label htmlFor="projet-select" className="block text-sm font-medium text-gray-700 mb-2">
          Projet
        </label>
        <select
          id="projet-select"
          value={projetSelectionne}
          onChange={(e) => setProjetId(e.target.value)}
          className="block w-full max-w-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          disabled={loadingProjets}
        >
          {loadingProjets && <option>Chargement...</option>}
          {projets.map((p: { id: string; nom: string; code: string }) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.nom}
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
          <SqueletteGraphique />
        </>
      )}

      {/* Contenu */}
      {stats && (
        <>
          {/* Cartes resume */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CarteResume
              icone={<ClockIcon className="w-6 h-6" />}
              valeur={`${stats.tempsTotal.toFixed(1)} j`}
              label="Temps total (ETP)"
              couleurIcone="text-blue-600 bg-blue-100"
            />
            <CarteResume
              icone={<UsersIcon className="w-6 h-6" />}
              valeur={String(nbContributeurs)}
              label="Contributeurs"
              couleurIcone="text-purple-600 bg-purple-100"
            />
            <CarteResume
              icone={<CheckCircleIcon className="w-6 h-6" />}
              valeur={`${tauxCompletionMoyen}%`}
              label="Taux completion moyen"
              couleurIcone="text-green-600 bg-green-100"
            />
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraphiqueActivites donnees={stats.parActivite} />
            <GraphiqueUtilisateurs donnees={stats.parUtilisateur} />
          </div>

          <GraphiqueEvolution donnees={stats.parJour} />
        </>
      )}
    </div>
  );
}
