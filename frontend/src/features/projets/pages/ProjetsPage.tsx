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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-sm text-gray-500">
            {projets.length} projet{projets.length > 1 ? 's' : ''}
          </p>
        </div>
        {estAdmin && (
          <button
            onClick={() => {
              setProjetEdite(null);
              setModaleProjetOuverte(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            Nouveau projet
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filtreActif}
            onChange={(e) => setFiltreActif(e.target.checked)}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">Afficher uniquement les projets actifs</span>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && projets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : projets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun projet</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Projet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Moderateurs
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Periode
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projets.map((projet) => (
                <tr
                  key={projet.id}
                  className={`hover:bg-gray-50 ${!projet.estActif ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                        {projet.code}
                      </span>
                      <span className="font-medium text-gray-900">{projet.nom}</span>
                    </div>
                    {projet.description && (
                      <p className="text-xs text-gray-500 mt-1">{projet.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {projet.moderateurs && projet.moderateurs.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {projet.moderateurs.map((m) => m.nomComplet).join(', ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Aucun</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {projet.dateDebut || projet.dateFin ? (
                      <>
                        {projet.dateDebut || '...'} - {projet.dateFin || '...'}
                      </>
                    ) : (
                      <span className="text-gray-400">Non definie</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setProjetPourActivites(projet);
                          setModaleActivitesOuverte(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-purple-600 rounded hover:bg-purple-50"
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
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
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
                          className="p-1.5 text-gray-400 hover:text-orange-600 rounded hover:bg-orange-50"
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
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmationSuppression(projet)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Voulez-vous vraiment supprimer le projet <strong>{confirmationSuppression.nom}</strong> ?
            </p>
            {erreurSuppression && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
