import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  ClockIcon,
  CheckCircleIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { MES_STATISTIQUES } from '../graphql/operations/statistics';
import SelecteurPeriode from '../components/dashboard/SelecteurPeriode';
import CarteResume from '../components/dashboard/CarteResume';
import GraphiqueRepartitionProjets from '../components/dashboard/GraphiqueRepartitionProjets';
import GraphiqueJournalier from '../components/dashboard/GraphiqueJournalier';

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

export default function DashboardPage() {
  const utilisateur = useAuthStore((state) => state.utilisateur);
  const initial = useMemo(() => periodeInitiale(), []);
  const [dateDebut, setDateDebut] = useState(initial.debut);
  const [dateFin, setDateFin] = useState(initial.fin);

  const { data, loading, error } = useQuery(MES_STATISTIQUES, {
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
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {utilisateur?.prenom} !
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue sur SAND - Saisie d'Activite Numerique Declarative
        </p>
      </div>

      {/* Carte profil */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon profil</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Nom complet</dt>
            <dd className="text-gray-900 font-medium">
              {utilisateur?.prenom} {utilisateur?.nom}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-gray-900">{utilisateur?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Equipe</dt>
            <dd className="text-gray-900">
              {utilisateur?.equipe?.nom || 'Non assignee'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Role</dt>
            <dd>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(utilisateur?.role || '')}`}
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
