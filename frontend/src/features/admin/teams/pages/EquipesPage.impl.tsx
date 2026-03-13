// Page de gestion des equipes (Admin)

import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  TEAMS_FULL_QUERY,
  CREATE_TEAM,
  UPDATE_TEAM,
  DELETE_TEAM,
} from '../../../../graphql/operations/teams';
import NavAdmin from '../../../../components/admin/NavAdmin';

interface Membre {
  id: string;
  nomComplet: string;
}

interface Equipe {
  id: string;
  nom: string;
  code: string;
  description?: string;
  estActif: boolean;
  membres: Membre[];
  createdAt: string;
}

interface EquipeFormData {
  id?: string;
  nom: string;
  code: string;
  description: string;
  estActif: boolean;
}

// Composant Formulaire
function FormulaireEquipe({
  ouvert,
  onFermer,
  onSuccess,
  equipe,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onSuccess: () => void;
  equipe: Equipe | null;
}) {
  const estEdition = !!equipe?.id;

  const [formData, setFormData] = useState<EquipeFormData>({
    nom: '',
    code: '',
    description: '',
    estActif: true,
  });
  const [erreur, setErreur] = useState('');

  const [createTeam, { loading: creationEnCours }] = useMutation(CREATE_TEAM);
  const [updateTeam, { loading: modificationEnCours }] = useMutation(UPDATE_TEAM);

  const enCours = creationEnCours || modificationEnCours;

  useEffect(() => {
    if (ouvert && equipe) {
      // Le formulaire historique se rehydrate depuis la prop `equipe` a l'ouverture.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: equipe.id,
        nom: equipe.nom,
        code: equipe.code,
        description: equipe.description || '',
        estActif: equipe.estActif,
      });
    } else if (ouvert) {
      setFormData({ nom: '', code: '', description: '', estActif: true });
    }
    setErreur('');
  }, [ouvert, equipe]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!formData.nom.trim() || !formData.code.trim()) {
      setErreur('Le nom et le code sont obligatoires');
      return;
    }

    try {
      if (estEdition) {
        await updateTeam({
          variables: {
            id: formData.id,
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim().toUpperCase(),
              description: formData.description.trim() || null,
              estActif: formData.estActif,
            },
          },
        });
      } else {
        await createTeam({
          variables: {
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim().toUpperCase(),
              description: formData.description.trim() || null,
              estActif: formData.estActif,
            },
          },
        });
      }
      onSuccess();
      onFermer();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setErreur(message);
    }
  };

  return (
    <Transition appear show={ouvert} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onFermer}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[color:var(--sand-ink)]/35" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/95 shadow-[0_32px_70px_-40px_rgba(52,78,65,0.8)] backdrop-blur transition-all">
                <div className="flex items-center justify-between border-b border-[color:var(--sand-line)] px-4 py-4">
                  <Dialog.Title className="font-['Fraunces',serif] text-2xl text-[color:var(--sand-ink)]">
                    {estEdition ? 'Modifier l\'equipe' : 'Nouvelle equipe'}
                  </Dialog.Title>
                  <button onClick={onFermer} className="rounded-full p-1.5 transition hover:bg-[color:var(--sand-surface-strong)]">
                    <XMarkIcon className="w-5 h-5 text-[color:var(--sand-muted)]" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 text-[color:var(--sand-ink)] outline-none transition focus:ring-2 focus:ring-[color:var(--sand-accent)]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]">Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Ex: DEV, RH, COMPTA"
                      className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 uppercase text-[color:var(--sand-ink)] outline-none transition focus:ring-2 focus:ring-[color:var(--sand-accent)]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 text-[color:var(--sand-ink)] outline-none transition focus:ring-2 focus:ring-[color:var(--sand-accent)]/20"
                    />
                  </div>

                  {estEdition && (
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="estActif"
                          checked={formData.estActif}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-[color:var(--sand-ink)]">Equipe active</span>
                      </label>
                    </div>
                  )}

                  {erreur && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {erreur}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 border-t border-[color:var(--sand-line)] pt-4">
                    <button
                      type="button"
                      onClick={onFermer}
                      className="rounded-full border border-[color:var(--sand-line)] bg-white/90 px-4 py-2 text-sm font-medium text-[color:var(--sand-ink)] transition hover:bg-[color:var(--sand-surface-strong)]"
                      disabled={enCours}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={enCours}
                      className="rounded-full bg-[color:var(--sand-ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--sand-accent-strong)] disabled:opacity-50"
                    >
                      {enCours ? 'Enregistrement...' : estEdition ? 'Modifier' : 'Creer'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Page principale
export default function EquipesPage() {
  const [filtreActif, setFiltreActif] = useState(true);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [equipeEditee, setEquipeEditee] = useState<Equipe | null>(null);
  const [confirmationSuppression, setConfirmationSuppression] = useState<Equipe | null>(null);
  const [erreurSuppression, setErreurSuppression] = useState('');

  const { data, loading, refetch } = useQuery<{ equipes: Equipe[] }>(TEAMS_FULL_QUERY, {
    variables: { actifSeulement: filtreActif || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteTeam, { loading: suppressionEnCours }] = useMutation(DELETE_TEAM);

  const equipes = data?.equipes || [];

  const ouvrirCreation = () => {
    setEquipeEditee(null);
    setModaleOuverte(true);
  };

  const ouvrirEdition = (equipe: Equipe) => {
    setEquipeEditee(equipe);
    setModaleOuverte(true);
  };

  const confirmerSuppression = async () => {
    if (!confirmationSuppression) return;
    try {
      await deleteTeam({ variables: { id: confirmationSuppression.id } });
      setConfirmationSuppression(null);
      setErreurSuppression('');
      refetch();
    } catch (err) {
      setErreurSuppression(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="space-y-4">
      <NavAdmin />

      {/* En-tete */}
      <div className="sand-card flex items-center justify-between rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(52,78,65,0.08),rgba(238,154,104,0.14))] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">Administration</p>
          <h1 className="font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">Equipes</h1>
          <p className="text-sm text-[color:var(--sand-muted)]">{equipes.length} equipe{equipes.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={ouvrirCreation}
          className="flex items-center gap-2 rounded-full bg-[color:var(--sand-ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--sand-accent-strong)]"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvelle equipe
        </button>
      </div>

      {/* Filtre */}
      <div className="sand-card rounded-[1.8rem] p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filtreActif}
            onChange={(e) => setFiltreActif(e.target.checked)}
            className="rounded border-[color:var(--sand-line)] text-[color:var(--sand-accent)] focus:ring-[color:var(--sand-accent)]/20"
          />
          <span className="text-sm text-[color:var(--sand-ink)]">Afficher uniquement les equipes actives</span>
        </label>
      </div>

      {/* Liste */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && equipes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-[color:var(--sand-muted)]">Chargement...</div>
        ) : equipes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-[color:var(--sand-muted)]">Aucune equipe trouvee</div>
        ) : (
          equipes.map((equipe) => (
            <div
              key={equipe.id}
              className={`sand-card rounded-[1.8rem] p-5 ${!equipe.estActif ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="mb-1 inline-flex items-center rounded-full bg-[color:var(--sand-accent)]/12 px-2.5 py-0.5 text-xs font-medium text-[color:var(--sand-accent-strong)]">
                    {equipe.code}
                  </span>
                  <h3 className="font-semibold text-[color:var(--sand-ink)]">{equipe.nom}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => ouvrirEdition(equipe)}
                    className="rounded-full p-1.5 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-accent-strong)]"
                    title="Modifier"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmationSuppression(equipe)}
                    className="rounded-full p-1.5 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-red-600"
                    title="Supprimer"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {equipe.description && (
                <p className="mb-3 text-sm text-[color:var(--sand-muted)]">{equipe.description}</p>
              )}

              <div className="flex items-center gap-1 text-xs text-[color:var(--sand-muted)]">
                <UsersIcon className="w-4 h-4" />
                <span>{equipe.membres.length} membre{equipe.membres.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal formulaire */}
      <FormulaireEquipe
        ouvert={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        onSuccess={() => refetch()}
        equipe={equipeEditee}
      />

      {/* Modal confirmation suppression */}
      {confirmationSuppression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sand-ink)]/35">
          <div className="mx-4 w-full max-w-sm rounded-[1.8rem] border border-white/70 bg-white/95 p-6 shadow-[0_32px_70px_-40px_rgba(52,78,65,0.8)] backdrop-blur">
            <h3 className="mb-2 font-['Fraunces',serif] text-2xl text-[color:var(--sand-ink)]">Confirmer la suppression</h3>
            <p className="mb-4 text-sm text-[color:var(--sand-muted)]">
              Voulez-vous vraiment supprimer l'equipe <strong>{confirmationSuppression.nom}</strong> ?
              {confirmationSuppression.membres.length > 0 && (
                <span className="block mt-2 text-orange-600">
                  Attention : cette equipe a {confirmationSuppression.membres.length} membre(s).
                </span>
              )}
            </p>
            {erreurSuppression && (
              <p className="mb-3 text-sm text-red-600">{erreurSuppression}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setConfirmationSuppression(null); setErreurSuppression(''); }}
                className="rounded-full border border-[color:var(--sand-line)] bg-white/90 px-4 py-2 text-sm font-medium text-[color:var(--sand-ink)] transition hover:bg-[color:var(--sand-surface-strong)]"
                disabled={suppressionEnCours}
              >
                Annuler
              </button>
              <button
                onClick={confirmerSuppression}
                disabled={suppressionEnCours}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
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
