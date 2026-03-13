import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Cog6ToothIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { PROJETS_QUERY, DELETE_PROJECT } from '../../../graphql/operations/projects';
import { useAuthStore } from '../../../stores/authStore';
import FormulaireProjet from '../components/FormulaireProjet';
import ConfigActivitesModal from '../components/ConfigActivitesModal';
import GestionModerateursModal from '../components/GestionModerateursModal';
import GestionVisibilitesModal from '../components/GestionVisibilitesModal';
import type { Projet } from '../types';

export default function ProjetsPageFeature() {
  const { utilisateur } = useAuthStore();
  const estAdmin = utilisateur?.role === 'ADMIN';

  const [filtreActif, setFiltreActif] = useState(true);
  const [modaleProjetOuverte, setModaleProjetOuverte] = useState(false);
  const [modaleActivitesOuverte, setModaleActivitesOuverte] = useState(false);
  const [modaleModerateursOuverte, setModaleModerateursOuverte] = useState(false);
  const [projetEdite, setProjetEdite] = useState<Projet | null>(null);
  const [projetPourActivites, setProjetPourActivites] = useState<Projet | null>(null);
  const [projetPourModerateurs, setProjetPourModerateurs] = useState<Projet | null>(null);
  const [modaleVisibilitesOuverte, setModaleVisibilitesOuverte] = useState(false);
  const [projetPourVisibilites, setProjetPourVisibilites] = useState<Projet | null>(null);
  const [confirmationSuppression, setConfirmationSuppression] = useState<Projet | null>(null);
  const [erreurSuppression, setErreurSuppression] = useState('');

  const { data, loading, refetch } = useQuery<{ projets: Projet[] }>(PROJETS_QUERY, {
    variables: { actif: filtreActif || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteProject, { loading: suppressionEnCours }] = useMutation(DELETE_PROJECT);
  const projets = data?.projets || [];

  const confirmerSuppression = async () => {
    if (!confirmationSuppression) return;

    setErreurSuppression('');
    try {
      await deleteProject({ variables: { id: confirmationSuppression.id } });
      setConfirmationSuppression(null);
      refetch();
    } catch (err) {
      setErreurSuppression(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-4">
      <div className="sand-card flex items-center justify-between rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(52,78,65,0.08),rgba(238,154,104,0.14))] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">
            Gouvernance
          </p>
          <h1 className="font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">Projets</h1>
          <p className="text-sm text-[color:var(--sand-muted)]">
            {projets.length} projet{projets.length > 1 ? 's' : ''}
          </p>
        </div>
        {estAdmin && (
          <button
            onClick={() => {
              setProjetEdite(null);
              setModaleProjetOuverte(true);
            }}
            className="flex items-center gap-2 rounded-full bg-[color:var(--sand-ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--sand-accent-strong)]"
          >
            <PlusIcon className="w-4 h-4" />
            Nouveau projet
          </button>
        )}
      </div>

      <div className="sand-card rounded-[1.8rem] p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filtreActif}
            onChange={(e) => setFiltreActif(e.target.checked)}
            className="rounded border-[color:var(--sand-line)] text-[color:var(--sand-accent)]"
          />
          <span className="text-sm text-[color:var(--sand-ink)]">Afficher uniquement les projets actifs</span>
        </label>
      </div>

      <div className="sand-card overflow-hidden rounded-[1.8rem]">
        {loading && projets.length === 0 ? (
          <div className="p-8 text-center text-[color:var(--sand-muted)]">Chargement...</div>
        ) : projets.length === 0 ? (
          <div className="p-8 text-center text-[color:var(--sand-muted)]">Aucun projet</div>
        ) : (
          <table className="min-w-full divide-y divide-[color:var(--sand-line)]">
            <thead className="bg-[color:var(--sand-surface-strong)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">
                  Projet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">
                  Moderateurs
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">
                  Periode
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--sand-muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--sand-line)]">
              {projets.map((projet) => (
                <tr
                  key={projet.id}
                  className={`transition hover:bg-[color:var(--sand-surface-strong)]/65 ${!projet.estActif ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-[color:var(--sand-accent)]/12 px-2.5 py-0.5 text-xs font-medium text-[color:var(--sand-accent-strong)]">
                        {projet.code}
                      </span>
                      <span className="font-medium text-[color:var(--sand-ink)]">{projet.nom}</span>
                    </div>
                    {projet.description && (
                      <p className="mt-1 text-xs text-[color:var(--sand-muted)]">{projet.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {projet.moderateurs && projet.moderateurs.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4 text-[color:var(--sand-muted)]" />
                        <span className="text-sm text-[color:var(--sand-muted)]">
                          {projet.moderateurs.map((m) => m.nomComplet).join(', ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-[color:var(--sand-muted)]">Aucun</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[color:var(--sand-muted)]">
                    {projet.dateDebut || projet.dateFin ? (
                      <>
                        {projet.dateDebut || '...'} - {projet.dateFin || '...'}
                      </>
                    ) : (
                      <span className="text-[color:var(--sand-muted)]">Non definie</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setProjetPourActivites(projet);
                          setModaleActivitesOuverte(true);
                        }}
                        className="rounded-full p-1.5 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-accent-strong)]"
                        title="Configurer les activites"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                      </button>
                      {estAdmin && (
                        <button
                          onClick={() => {
                            setProjetPourModerateurs(projet);
                            setModaleModerateursOuverte(true);
                          }}
                          className="rounded-full p-1.5 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-green-700"
                          title="Gerer les moderateurs"
                        >
                          <UserGroupIcon className="w-4 h-4" />
                        </button>
                      )}
                      {estAdmin && (
                        <button
                          onClick={() => {
                            setProjetPourVisibilites(projet);
                            setModaleVisibilitesOuverte(true);
                          }}
                          className="rounded-full p-1.5 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-orange-600"
                          title="Restrictions de visibilite"
                        >
                          <EyeSlashIcon className="w-4 h-4" />
                        </button>
                      )}
                      {estAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setProjetEdite(projet);
                              setModaleProjetOuverte(true);
                            }}
                            className="rounded-full p-1.5 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-accent-strong)]"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmationSuppression(projet)}
                            className="rounded-full p-1.5 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-red-600"
                            title="Supprimer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <FormulaireProjet
        ouvert={modaleProjetOuverte}
        onFermer={() => setModaleProjetOuverte(false)}
        onSuccess={() => refetch()}
        projet={projetEdite}
      />

      <ConfigActivitesModal
        ouvert={modaleActivitesOuverte}
        onFermer={() => setModaleActivitesOuverte(false)}
        projet={projetPourActivites}
        onSuccess={() => refetch()}
      />

      <GestionModerateursModal
        ouvert={modaleModerateursOuverte}
        onFermer={() => setModaleModerateursOuverte(false)}
        projet={projetPourModerateurs}
        onSuccess={() => refetch()}
      />

      <GestionVisibilitesModal
        ouvert={modaleVisibilitesOuverte}
        onFermer={() => setModaleVisibilitesOuverte(false)}
        projet={projetPourVisibilites}
        onSuccess={() => refetch()}
      />

      {confirmationSuppression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sand-ink)]/35">
          <div className="w-full max-w-sm rounded-[1.8rem] border border-white/70 bg-white/95 p-6 shadow-[0_32px_70px_-40px_rgba(52,78,65,0.8)] backdrop-blur mx-4">
            <h3 className="mb-2 font-['Fraunces',serif] text-2xl text-[color:var(--sand-ink)]">
              Confirmer la suppression
            </h3>
            <p className="mb-4 text-sm text-[color:var(--sand-muted)]">
              Voulez-vous vraiment supprimer le projet <strong>{confirmationSuppression.nom}</strong> ?
            </p>
            {erreurSuppression && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erreurSuppression}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmationSuppression(null);
                  setErreurSuppression('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                disabled={suppressionEnCours}
              >
                Annuler
              </button>
              <button
                onClick={confirmerSuppression}
                disabled={suppressionEnCours}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {suppressionEnCours ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
