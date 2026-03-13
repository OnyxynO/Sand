import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  ClockIcon,
  CheckCircleIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../stores/authStore';
import { MES_STATISTIQUES } from '../../../graphql/operations/statistics';
import SelecteurPeriode from '../components/SelecteurPeriode';
import CarteResume from '../components/CarteResume';
import GraphiqueRepartitionProjets from '../components/GraphiqueRepartitionProjets';
import GraphiqueJournalier from '../components/GraphiqueJournalier';
import { periodeInitiale } from '../../../hooks/usePeriode';

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
        return 'bg-[color:var(--sand-accent-soft)] text-[color:var(--sand-accent-strong)]';
      case 'MODERATEUR':
        return 'bg-amber-50 text-amber-800';
      default:
        return 'bg-[color:var(--sand-surface-strong)] text-[color:var(--sand-muted)]';
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
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">Profil</p>
              <p className="mt-2 text-lg font-medium text-[color:var(--sand-ink)]">
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[var(--sand-accent-soft)] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">Equipe</p>
                <p className="mt-2 font-medium text-[color:var(--sand-ink)]">{utilisateur?.equipe?.nom || 'Non assignee'}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">Role</p>
                <p className="mt-2 font-medium text-[color:var(--sand-ink)]">{getRoleLabel(utilisateur?.role || '')}</p>
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
            <dt className="text-xs uppercase tracking-[0.18em] text-[color:var(--sand-muted)]">Nom complet</dt>
            <dd className="mt-2 text-[color:var(--sand-ink)] font-medium">
              {utilisateur?.prenom} {utilisateur?.nom}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-[color:var(--sand-muted)]">Email</dt>
            <dd className="mt-2 text-[color:var(--sand-ink)]">{utilisateur?.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-[color:var(--sand-muted)]">Equipe</dt>
            <dd className="mt-2 text-[color:var(--sand-ink)]">
              {utilisateur?.equipe?.nom || 'Non assignee'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-[color:var(--sand-muted)]">Role</dt>
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

      {/* Erreur chargement */}
      {error && (
        <div className="rounded-[1.8rem] border border-red-200 bg-red-50 p-4 text-red-700">
          Erreur lors du chargement des statistiques : {error.message}
        </div>
      )}

      {/* Spinner chargement */}
      {loading && !stats && (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[color:var(--sand-accent-soft)] border-t-[color:var(--sand-accent)]" />
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
              couleurIcone="text-[color:var(--sand-accent)] bg-[color:var(--sand-accent-soft)]"
            />
            <CarteResume
              icone={<CheckCircleIcon className="w-6 h-6" />}
              valeur={`${tauxCompletion}%`}
              label="Jours complets"
              couleurIcone="text-emerald-700 bg-emerald-50"
            />
            <CarteResume
              icone={<FolderIcon className="w-6 h-6" />}
              valeur={String(nbProjets)}
              label="Projets actifs"
              couleurIcone="text-amber-700 bg-amber-50"
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
