// Page de gestion des projets (Admin/Moderateur)

import { useState, useEffect, Fragment, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import ToastAnnulation from '../components/ui/ToastAnnulation';
import {
  PROJETS_QUERY,
  PROJET_QUERY,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  SET_PROJECT_ACTIVITIES,
} from '../graphql/operations/projects';
import { ARBRE_ACTIVITES } from '../graphql/operations/activities';
import { USERS_QUERY } from '../graphql/operations/users';
import { useAuthStore } from '../stores/authStore';

interface Projet {
  id: string;
  nom: string;
  code: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  estActif: boolean;
  moderateurs?: { id: string; nomComplet: string }[];
  activitesActives?: { id: string; nom: string; chemin: string }[];
}

interface Activite {
  id: string;
  nom: string;
  chemin: string;
  niveau: number;
  estFeuille: boolean;
  estActif: boolean;
  enfants?: Activite[];
}

// Formulaire projet
function FormulaireProjet({
  ouvert,
  onFermer,
  onSuccess,
  projet,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onSuccess: () => void;
  projet: Projet | null;
}) {
  const estEdition = !!projet?.id;
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    estActif: true,
  });
  const [erreur, setErreur] = useState('');

  const [createProject, { loading: creationEnCours }] = useMutation(CREATE_PROJECT);
  const [updateProject, { loading: modificationEnCours }] = useMutation(UPDATE_PROJECT);

  useEffect(() => {
    if (ouvert && projet) {
      setFormData({
        nom: projet.nom,
        code: projet.code,
        description: projet.description || '',
        dateDebut: projet.dateDebut || '',
        dateFin: projet.dateFin || '',
        estActif: projet.estActif,
      });
    } else if (ouvert) {
      setFormData({ nom: '', code: '', description: '', dateDebut: '', dateFin: '', estActif: true });
    }
    setErreur('');
  }, [ouvert, projet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!formData.nom.trim() || !formData.code.trim()) {
      setErreur('Le nom et le code sont obligatoires');
      return;
    }

    try {
      if (estEdition) {
        await updateProject({
          variables: {
            id: projet!.id,
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim().toUpperCase(),
              description: formData.description.trim() || null,
              dateDebut: formData.dateDebut || null,
              dateFin: formData.dateFin || null,
              estActif: formData.estActif,
            },
          },
        });
      } else {
        await createProject({
          variables: {
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim().toUpperCase(),
              description: formData.description.trim() || null,
              dateDebut: formData.dateDebut || null,
              dateFin: formData.dateFin || null,
              estActif: formData.estActif,
            },
          },
        });
      }
      onSuccess();
      onFermer();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <Transition appear show={ouvert} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onFermer}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold">{estEdition ? 'Modifier' : 'Nouveau'} projet</Dialog.Title>
                  <button onClick={onFermer} className="p-1 rounded hover:bg-gray-100"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                      <input type="text" value={formData.nom} onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                      <input type="text" value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date debut</label>
                      <input type="date" value={formData.dateDebut} onChange={(e) => setFormData((p) => ({ ...p, dateDebut: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                      <input type="date" value={formData.dateFin} onChange={(e) => setFormData((p) => ({ ...p, dateFin: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  {estEdition && (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.estActif} onChange={(e) => setFormData((p) => ({ ...p, estActif: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">Projet actif</span>
                    </label>
                  )}
                  {erreur && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{erreur}</div>}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onFermer} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" disabled={creationEnCours || modificationEnCours} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {creationEnCours || modificationEnCours ? 'Enregistrement...' : estEdition ? 'Modifier' : 'Creer'}
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

// Composant checkbox tri-state pour l'arbre d'activites
function CheckboxTriState({
  checked,
  indeterminate,
  onChange,
  disabled,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`w-4 h-4 rounded border flex items-center justify-center ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        checked
          ? 'bg-blue-600 border-blue-600'
          : indeterminate
          ? 'bg-blue-300 border-blue-400'
          : 'bg-white border-gray-300 hover:border-blue-500'
      }`}
    >
      {checked && <CheckIcon className="w-3 h-3 text-white" />}
      {indeterminate && !checked && <div className="w-2 h-0.5 bg-white" />}
    </button>
  );
}

// Ligne d'activite avec checkbox
function LigneActiviteCheckbox({
  activite,
  niveau,
  selectionnees,
  onToggle,
  getEtatActivite,
}: {
  activite: Activite;
  niveau: number;
  selectionnees: Set<string>;
  onToggle: (id: string, enfantIds: string[]) => void;
  getEtatActivite: (a: Activite) => { checked: boolean; indeterminate: boolean };
}) {
  const { checked, indeterminate } = getEtatActivite(activite);
  const aEnfants = activite.enfants && activite.enfants.length > 0;

  // Collecter tous les IDs descendants (feuilles seulement)
  const collecterFeuillesIds = (a: Activite): string[] => {
    if (a.estFeuille) return [a.id];
    if (!a.enfants) return [];
    return a.enfants.flatMap(collecterFeuillesIds);
  };

  return (
    <>
      <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50"
        style={{ paddingLeft: `${niveau * 20 + 8}px` }}
      >
        <CheckboxTriState
          checked={checked}
          indeterminate={indeterminate}
          onChange={() => onToggle(activite.id, collecterFeuillesIds(activite))}
          disabled={!activite.estActif}
        />
        <span className={`text-sm ${!activite.estActif ? 'text-gray-400' : ''}`}>
          {activite.nom}
        </span>
        {activite.estFeuille && (
          <span className="text-xs text-green-600 bg-green-50 px-1 rounded">saisissable</span>
        )}
      </div>
      {aEnfants &&
        activite.enfants!.map((enfant) => (
          <LigneActiviteCheckbox
            key={enfant.id}
            activite={enfant}
            niveau={niveau + 1}
            selectionnees={selectionnees}
            onToggle={onToggle}
            getEtatActivite={getEtatActivite}
          />
        ))}
    </>
  );
}

// Modal de configuration des activites
function ConfigActivitesModal({
  ouvert,
  onFermer,
  projet,
  onSuccess,
}: {
  ouvert: boolean;
  onFermer: () => void;
  projet: Projet | null;
  onSuccess: () => void;
}) {
  const [selectionnees, setSelectionnees] = useState<Set<string>>(new Set());
  // Pour le toast d'annulation
  const [toastVisible, setToastVisible] = useState(false);
  const [nbDesactivees, setNbDesactivees] = useState(0);
  const etatInitialRef = useRef<Set<string>>(new Set());

  const { data: dataActivites } = useQuery<{ arbreActivites: Activite[] }>(ARBRE_ACTIVITES, {
    skip: !ouvert,
  });

  const { data: dataProjet } = useQuery<{ projet: Projet }>(PROJET_QUERY, {
    variables: { id: projet?.id },
    skip: !ouvert || !projet?.id,
    fetchPolicy: 'network-only',
  });

  const [setProjectActivities, { loading }] = useMutation(SET_PROJECT_ACTIVITIES);

  const activites = dataActivites?.arbreActivites || [];

  // Initialiser avec les activites deja selectionnees
  useEffect(() => {
    if (dataProjet?.projet?.activitesActives) {
      const initialIds = new Set(dataProjet.projet.activitesActives.map((a) => a.id));
      setSelectionnees(initialIds);
      etatInitialRef.current = initialIds;
    }
  }, [dataProjet]);

  // Collecter toutes les feuilles
  const collecterToutesLesFeuilles = (liste: Activite[]): string[] => {
    return liste.flatMap((a) => {
      if (a.estFeuille) return [a.id];
      if (a.enfants) return collecterToutesLesFeuilles(a.enfants);
      return [];
    });
  };

  const toutesLesFeuilles = useMemo(() => collecterToutesLesFeuilles(activites), [activites]);

  // Calculer l'etat d'une activite (checked/indeterminate)
  const getEtatActivite = (activite: Activite): { checked: boolean; indeterminate: boolean } => {
    if (activite.estFeuille) {
      return { checked: selectionnees.has(activite.id), indeterminate: false };
    }

    const feuillesIds = activite.enfants ? collecterToutesLesFeuilles([activite]) : [];
    const nbSelectionnees = feuillesIds.filter((id) => selectionnees.has(id)).length;

    if (nbSelectionnees === 0) {
      return { checked: false, indeterminate: false };
    }
    if (nbSelectionnees === feuillesIds.length) {
      return { checked: true, indeterminate: false };
    }
    return { checked: false, indeterminate: true };
  };

  // Toggle une activite (et ses descendants)
  const handleToggle = (id: string, enfantIds: string[]) => {
    setSelectionnees((prev) => {
      const next = new Set(prev);
      // Si c'est une feuille
      if (enfantIds.length === 1 && enfantIds[0] === id) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        // Si c'est un parent, toggle tous les enfants
        const tousSelectionnees = enfantIds.every((eid) => next.has(eid));
        if (tousSelectionnees) {
          enfantIds.forEach((eid) => next.delete(eid));
        } else {
          enfantIds.forEach((eid) => next.add(eid));
        }
      }
      return next;
    });
  };

  // Tout selectionner / Tout deselectionner
  const toutSelectionner = () => setSelectionnees(new Set(toutesLesFeuilles));
  const toutDeselectionner = () => setSelectionnees(new Set());

  // Effectuer la sauvegarde effective
  const effectuerSauvegarde = useCallback(async () => {
    try {
      await setProjectActivities({
        variables: {
          projetId: projet!.id,
          activiteIds: Array.from(selectionnees),
        },
      });
      setToastVisible(false);
      onSuccess();
      onFermer();
    } catch (err) {
      console.error('Erreur:', err);
      setToastVisible(false);
    }
  }, [projet, selectionnees, setProjectActivities, onSuccess, onFermer]);

  // Annuler et restaurer l'etat precedent
  const handleAnnulerDesactivation = useCallback(() => {
    setSelectionnees(etatInitialRef.current);
    setToastVisible(false);
  }, []);

  // Clic sur Enregistrer
  const handleSave = async () => {
    // Calculer le nombre d'activites desactivees
    const desactivees = [...etatInitialRef.current].filter((id) => !selectionnees.has(id));

    if (desactivees.length > 3) {
      // Afficher le toast d'annulation
      setNbDesactivees(desactivees.length);
      setToastVisible(true);
    } else {
      // Sauvegarder directement
      await effectuerSauvegarde();
    }
  };

  return (
    <>
      <Transition appear show={ouvert} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onFermer}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <Dialog.Title className="text-lg font-semibold">
                      Activites pour {projet?.nom}
                    </Dialog.Title>
                    <button onClick={onFermer} className="p-1 rounded hover:bg-gray-100">
                      <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {selectionnees.size} activite(s) selectionnee(s)
                    </span>
                    <div className="flex gap-2">
                      <button onClick={toutSelectionner} className="text-xs text-blue-600 hover:underline">
                        Tout selectionner
                      </button>
                      <button onClick={toutDeselectionner} className="text-xs text-gray-500 hover:underline">
                        Tout deselectionner
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {activites.map((activite) => (
                      <LigneActiviteCheckbox
                        key={activite.id}
                        activite={activite}
                        niveau={0}
                        selectionnees={selectionnees}
                        onToggle={handleToggle}
                        getEtatActivite={getEtatActivite}
                      />
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 p-4 border-t">
                    <button onClick={onFermer} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
                      Annuler
                    </button>
                    <button onClick={handleSave} disabled={loading || toastVisible} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Toast d'annulation */}
      <ToastAnnulation
        visible={toastVisible}
        message={`${nbDesactivees} activite(s) desactivee(s)`}
        delaiMs={5000}
        onAnnuler={handleAnnulerDesactivation}
        onExpire={effectuerSauvegarde}
      />
    </>
  );
}

// Page principale
export default function ProjetsPage() {
  const { utilisateur } = useAuthStore();
  const estAdmin = utilisateur?.role === 'ADMIN';

  const [filtreActif, setFiltreActif] = useState(true);
  const [modaleProjetOuverte, setModaleProjetOuverte] = useState(false);
  const [modaleActivitesOuverte, setModaleActivitesOuverte] = useState(false);
  const [projetEdite, setProjetEdite] = useState<Projet | null>(null);
  const [projetPourActivites, setProjetPourActivites] = useState<Projet | null>(null);
  const [confirmationSuppression, setConfirmationSuppression] = useState<Projet | null>(null);

  const { data, loading, refetch } = useQuery<{ projets: Projet[] }>(PROJETS_QUERY, {
    variables: { actif: filtreActif || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteProject, { loading: suppressionEnCours }] = useMutation(DELETE_PROJECT);

  const projets = data?.projets || [];

  const ouvrirActivites = (projet: Projet) => {
    setProjetPourActivites(projet);
    setModaleActivitesOuverte(true);
  };

  const confirmerSuppression = async () => {
    if (!confirmationSuppression) return;
    try {
      await deleteProject({ variables: { id: confirmationSuppression.id } });
      setConfirmationSuppression(null);
      refetch();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-sm text-gray-500">{projets.length} projet{projets.length > 1 ? 's' : ''}</p>
        </div>
        {estAdmin && (
          <button
            onClick={() => { setProjetEdite(null); setModaleProjetOuverte(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            Nouveau projet
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={filtreActif} onChange={(e) => setFiltreActif(e.target.checked)} className="rounded border-gray-300 text-blue-600" />
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Projet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Moderateurs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Periode</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projets.map((projet) => (
                <tr key={projet.id} className={`hover:bg-gray-50 ${!projet.estActif ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                        {projet.code}
                      </span>
                      <span className="font-medium text-gray-900">{projet.nom}</span>
                    </div>
                    {projet.description && <p className="text-xs text-gray-500 mt-1">{projet.description}</p>}
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
                        onClick={() => ouvrirActivites(projet)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 rounded hover:bg-purple-50"
                        title="Configurer les activites"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                      </button>
                      {estAdmin && (
                        <>
                          <button
                            onClick={() => { setProjetEdite(projet); setModaleProjetOuverte(true); }}
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

      {confirmationSuppression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-4">
              Voulez-vous vraiment supprimer le projet <strong>{confirmationSuppression.nom}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmationSuppression(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50" disabled={suppressionEnCours}>
                Annuler
              </button>
              <button onClick={confirmerSuppression} disabled={suppressionEnCours} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                {suppressionEnCours ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
