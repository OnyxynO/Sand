import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  ClockIcon,
  CheckCircleIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { MES_STATISTIQUES } from '../graphql/operations/statistics';
import SelecteurPeriode from '../features/dashboard/components/SelecteurPeriode';
import CarteResume from '../features/dashboard/components/CarteResume';
import GraphiqueRepartitionProjets from '../features/dashboard/components/GraphiqueRepartitionProjets';
import GraphiqueJournalier from '../features/dashboard/components/GraphiqueJournalier';
import { periodeInitiale } from '../hooks/usePeriode';

interface MesStatistiquesData {
  statistiques: {
    tempsTotal: number;
    parProjet: Array<{
      projet: { id: string; nom: string; code: string };
      tempsTotal: number;
      pourcentage: number;
    }>;
    parJour: Array<{
      date: string;
      tempsTotal: number;
      estComplet: boolean;
    }>;
  };
}

export default function DashboardPage() {
  const utilisateur = useAuthStore((state) => state.utilisateur);
  const initial = useMemo(() => periodeInitiale(), []);
  const [dateDebut, setDateDebut] = useState(initial.debut);
  const [dateFin, setDateFin] = useState(initial.fin);

  const { data, loading, error } = useQuery<MesStatistiquesData>(MES_STATISTIQUES, {
    variables: { dateDebut, dateFin },
    fetchPolicy: 'cache-and-network',
  });

  const stats = data?.statistiques;

  const tauxCompletion = useMemo(() => {
    if (!stats?.parJour || stats.parJour.length === 0) return 0;
    const joursComplets = stats.parJour.filter((j: { estComplet: boolean }) => j.estComplet).length;
    return Math.round((joursComplets / stats.parJour.length) * 100);
  }, [stats]);

  const nbProjets = stats?.parProjet?.length ?? 0;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'MODERATEUR':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'MODERATEUR':
        return 'Moderateur';
      default:
        return 'Utilisateur';
    }
  };

  const handleChangePeriode = (debut: string, fin: string) => {
    setDateDebut(debut);
    setDateFin(fin);
  };

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="sand-card overflow-hidden rounded-[32px]">
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--sand-accent)]">Tableau de bord personnel</p>
            <h1 className="sand-display mt-3 text-4xl leading-tight text-gray-900">
              Bonjour, {utilisateur?.prenom}.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
              Cette v2 garde les memes flux que SAND, mais pose une presentation plus calme et plus lisible.
              Tu retrouves ici ta charge recente, tes projets actifs et ton rythme de saisie du mois.
            </p>
          </div>
          <div className="grid gap-3 rounded-[28px] border border-[var(--sand-line)] bg-white/65 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Profil</p>
              <p className="mt-2 text-lg font-medium text-gray-900">
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="rounded-2xl bg-[var(--sand-accent-soft)] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Equipe</p>
                <p className="mt-2 font-medium text-gray-900">{utilisateur?.equipe?.nom || 'Non assignee'}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Role</p>
                <p className="mt-2 font-medium text-gray-900">{getRoleLabel(utilisateur?.role || '')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carte profil */}
      <div className="sand-card rounded-[28px] p-6">
        <h2 className="sand-display text-2xl text-gray-900">Mon profil</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-gray-500">Nom complet</dt>
            <dd className="mt-2 text-gray-900 font-medium">
              {utilisateur?.prenom} {utilisateur?.nom}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-gray-500">Email</dt>
            <dd className="mt-2 text-gray-900">{utilisateur?.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-gray-500">Equipe</dt>
            <dd className="mt-2 text-gray-900">
              {utilisateur?.equipe?.nom || 'Non assignee'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-gray-500">Role</dt>
            <dd className="mt-2">
              <span
                className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full ${getRoleBadgeColor(utilisateur?.role || '')}`}
              >
                {getRoleLabel(utilisateur?.role || '')}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Selecteur de periode */}
      <SelecteurPeriode
        dateDebut={dateDebut}
        dateFin={dateFin}
        onChangePeriode={handleChangePeriode}
      />

      {/* Contenu statistiques */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Erreur lors du chargement des statistiques : {error.message}
        </div>
      )}

      {loading && !stats && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

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
              icone={<CheckCircleIcon className="w-6 h-6" />}
              valeur={`${tauxCompletion}%`}
              label="Jours complets"
              couleurIcone="text-green-600 bg-green-100"
            />
            <CarteResume
              icone={<FolderIcon className="w-6 h-6" />}
              valeur={String(nbProjets)}
              label="Projets actifs"
              couleurIcone="text-purple-600 bg-purple-100"
            />
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraphiqueRepartitionProjets donnees={stats.parProjet} />
            <GraphiqueJournalier donnees={stats.parJour} />
          </div>
        </>
      )}
    </div>
  );
}
