// Page de gestion de l'arborescence des activites (Admin)

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  LockClosedIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  ARBRE_ACTIVITES,
  CREATE_ACTIVITY,
  UPDATE_ACTIVITY,
  DELETE_ACTIVITY,
  MOVE_ACTIVITY,
} from '../../graphql/operations/activities';
import NavAdmin from '../../components/admin/NavAdmin';
import SelectionParentModal from '../../components/admin/SelectionParentModal';
import VueTexteActivites from '../../components/admin/VueTexteActivites';
import useArbreDnd from '../../hooks/useArbreDnd';
import type { InfoDrop } from '../../hooks/useArbreDnd';

interface Activite {
  id: string;
  nom: string;
  code?: string;
  description?: string;
  chemin: string;
  niveau: number;
  ordre: number;
  estFeuille: boolean;
  estSysteme: boolean;
  estActif: boolean;
  enfants?: Activite[];
}

interface ActiviteFormData {
  id?: string;
  nom: string;
  code: string;
  description: string;
  parentId?: string;
  estActif: boolean;
}

// Composant ligne d'activite avec drag-and-drop (rendu aplati)
function LigneActiviteDnd({
  activite,
  niveau,
  ouverts,
  toggleOuvert,
  onEditer,
  onSupprimer,
  onAjouterEnfant,
  onMonter,
  onDescendre,
  onDeplacer,
  estPremier,
  estDernier,
  activeDragId,
  infoDrop,
}: {
  activite: Activite;
  niveau: number;
  ouverts: Set<string>;
  toggleOuvert: (id: string) => void;
  onEditer: (a: Activite) => void;
  onSupprimer: (a: Activite) => void;
  onAjouterEnfant: (parentId: string) => void;
  onMonter: (a: Activite) => void;
  onDescendre: (a: Activite) => void;
  onDeplacer: (a: Activite) => void;
  estPremier: boolean;
  estDernier: boolean;
  activeDragId: string | null;
  infoDrop: InfoDrop | null;
}) {
  const aEnfants = activite.enfants && activite.enfants.length > 0;
  const estOuvert = ouverts.has(activite.id);
  const estEnDrag = activeDragId === activite.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activite.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Indicateur visuel de drop
  const estCibleDrop = infoDrop?.cibleId === activite.id;
  const typeDrop = estCibleDrop ? infoDrop?.type : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${estEnDrag ? 'opacity-30' : ''}`}
    >
      {/* Indicateur de drop entre freres (ligne bleue au-dessus) */}
      {typeDrop === 'entre-freres' && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10"
          style={{ marginLeft: `${niveau * 24 + 12}px` }}
        />
      )}

      <div
        className={`group flex items-center gap-2 py-2 px-3 hover:bg-gray-50 border-b ${
          !activite.estActif ? 'opacity-50' : ''
        } ${typeDrop === 'devenir-enfant' ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset' : ''}`}
        style={{ paddingLeft: `${niveau * 24 + 12}px` }}
      >
        {/* Poignee de drag */}
        <button
          {...attributes}
          {...listeners}
          className="p-0.5 rounded cursor-grab opacity-0 group-hover:opacity-100 hover:bg-gray-200 touch-none"
          title="Glisser pour deplacer"
          data-testid={`drag-handle-${activite.id}`}
        >
          <Bars3Icon className="w-4 h-4 text-gray-400" />
        </button>

        {/* Chevron */}
        <button
          onClick={() => toggleOuvert(activite.id)}
          className={`p-0.5 rounded ${aEnfants ? 'hover:bg-gray-200' : 'invisible'}`}
          disabled={!aEnfants}
        >
          {estOuvert ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Nom et code */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{activite.nom}</span>
            {activite.code && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {activite.code}
              </span>
            )}
            {activite.estSysteme && (
              <LockClosedIcon className="w-4 h-4 text-orange-500" title="Activite systeme" />
            )}
            {activite.estFeuille && (
              <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                Saisissable
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
          {/* Monter/Descendre (toutes les activites, y compris systeme) */}
          <button
            onClick={() => onMonter(activite)}
            disabled={estPremier}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 disabled:opacity-30"
            title="Monter"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDescendre(activite)}
            disabled={estDernier}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 disabled:opacity-30"
            title="Descendre"
          >
            <ArrowDownIcon className="w-4 h-4" />
          </button>

          {/* Deplacer */}
          {!activite.estSysteme && (
            <button
              onClick={() => onDeplacer(activite)}
              className="p-1 text-gray-400 hover:text-purple-600 rounded hover:bg-purple-50"
              title="Deplacer vers un autre parent"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}

          {/* Ajouter enfant */}
          <button
            onClick={() => onAjouterEnfant(activite.id)}
            className="p-1 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
            title="Ajouter une sous-activite"
          >
            <PlusIcon className="w-4 h-4" />
          </button>

          {/* Editer */}
          {!activite.estSysteme && (
            <button
              onClick={() => onEditer(activite)}
              className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
              title="Modifier"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          )}

          {/* Supprimer */}
          {!activite.estSysteme && (
            <button
              onClick={() => onSupprimer(activite)}
              className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
              title="Supprimer"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Overlay affiche pendant le drag (apercu flottant)
function DragPreview({ activite }: { activite: Activite }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-white rounded-lg shadow-lg border border-blue-200 opacity-90">
      <Bars3Icon className="w-4 h-4 text-gray-400" />
      <span className="font-medium text-gray-900">{activite.nom}</span>
      {activite.code && (
        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
          {activite.code}
        </span>
      )}
      {activite.estSysteme && (
        <LockClosedIcon className="w-4 h-4 text-orange-500" />
      )}
    </div>
  );
}

// Formulaire d'activite
function FormulaireActivite({
  ouvert,
  onFermer,
  onSuccess,
  activite,
  parentId,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onSuccess: () => void;
  activite: Activite | null;
  parentId: string | null;
}) {
  const estEdition = !!activite?.id;

  const [formData, setFormData] = useState<ActiviteFormData>({
    nom: '',
    code: '',
    description: '',
    estActif: true,
  });
  const [erreur, setErreur] = useState('');

  const [createActivity, { loading: creationEnCours }] = useMutation(CREATE_ACTIVITY);
  const [updateActivity, { loading: modificationEnCours }] = useMutation(UPDATE_ACTIVITY);

  const enCours = creationEnCours || modificationEnCours;

  useEffect(() => {
    if (ouvert && activite) {
      setFormData({
        id: activite.id,
        nom: activite.nom,
        code: activite.code || '',
        description: activite.description || '',
        estActif: activite.estActif,
      });
    } else if (ouvert) {
      setFormData({
        nom: '',
        code: '',
        description: '',
        parentId: parentId || undefined,
        estActif: true,
      });
    }
    setErreur('');
  }, [ouvert, activite, parentId]);

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

    if (!formData.nom.trim()) {
      setErreur('Le nom est obligatoire');
      return;
    }

    try {
      if (estEdition) {
        await updateActivity({
          variables: {
            id: formData.id,
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim() || null,
              description: formData.description.trim() || null,
              estActif: formData.estActif,
            },
          },
        });
      } else {
        await createActivity({
          variables: {
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim() || null,
              description: formData.description.trim() || null,
              parentId: parentId || null,
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
          <div className="fixed inset-0 bg-black/30" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {estEdition ? 'Modifier l\'activite' : 'Nouvelle activite'}
                  </Dialog.Title>
                  <button onClick={onFermer} className="p-1 rounded hover:bg-gray-100">
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Ex: DEV, REUNION"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <span className="text-sm text-gray-700">Activite active</span>
                      </label>
                    </div>
                  )}

                  {erreur && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {erreur}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onFermer}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                      disabled={enCours}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={enCours}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
export default function ActivitesPage() {
  const [vueActive, setVueActive] = useState<'arbre' | 'texte'>('arbre');
  const [ouverts, setOuverts] = useState<Set<string>>(new Set());
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [activiteEditee, setActiviteEditee] = useState<Activite | null>(null);
  const [parentIdPourCreation, setParentIdPourCreation] = useState<string | null>(null);
  const [confirmationSuppression, setConfirmationSuppression] = useState<Activite | null>(null);
  const [activiteADeplacer, setActiviteADeplacer] = useState<Activite | null>(null);

  const { data, loading, refetch } = useQuery<{ arbreActivites: Activite[] }>(ARBRE_ACTIVITES, {
    fetchPolicy: 'cache-and-network',
  });

  const [deleteActivity, { loading: suppressionEnCours }] = useMutation(DELETE_ACTIVITY);
  const [moveActivity] = useMutation(MOVE_ACTIVITY);

  const activites = data?.arbreActivites || [];

  // Callback pour le hook DnD
  const handleMoveActivityDnd = useCallback(
    async (id: string, parentId: string | null, ordre: number) => {
      await moveActivity({ variables: { id, parentId, ordre } });
      refetch();
    },
    [moveActivity, refetch],
  );

  // Hook DnD
  const {
    listeAplatie,
    activeDragId,
    activeDrag,
    infoDrop,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useArbreDnd(activites, ouverts, handleMoveActivityDnd);

  // Sensors DnD : activation apres 5px de deplacement (evite conflits avec clics)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // Ouvrir tous les noeuds au chargement
  useEffect(() => {
    if (activites.length > 0 && ouverts.size === 0) {
      const tousLesIds = new Set<string>();
      const collecterIds = (liste: Activite[]) => {
        liste.forEach((a) => {
          tousLesIds.add(a.id);
          if (a.enfants) collecterIds(a.enfants);
        });
      };
      collecterIds(activites);
      setOuverts(tousLesIds);
    }
  }, [activites, ouverts.size]);

  const toggleOuvert = (id: string) => {
    setOuverts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const ouvrirCreation = (parentId: string | null = null) => {
    setActiviteEditee(null);
    setParentIdPourCreation(parentId);
    setModaleOuverte(true);
  };

  const ouvrirEdition = (activite: Activite) => {
    setActiviteEditee(activite);
    setParentIdPourCreation(null);
    setModaleOuverte(true);
  };

  const confirmerSuppression = async () => {
    if (!confirmationSuppression) return;
    try {
      await deleteActivity({ variables: { id: confirmationSuppression.id } });
      setConfirmationSuppression(null);
      refetch();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  // Trouver le parent d'une activite (retourne null si racine)
  const trouverParentId = (id: string, liste: Activite[] = activites): string | null => {
    for (const a of liste) {
      if (a.enfants?.some((e) => e.id === id)) {
        return a.id; // Trouve ! Le parent est 'a'
      }
      if (a.enfants) {
        const result = trouverParentId(id, a.enfants);
        if (result !== null) return result;
      }
    }
    return null; // C'est une racine
  };

  // Trouver les freres d'une activite
  const trouverFreres = (id: string, liste: Activite[] = activites): Activite[] => {
    for (const a of liste) {
      if (a.enfants?.some((e) => e.id === id)) {
        return a.enfants;
      }
      if (a.enfants) {
        const result = trouverFreres(id, a.enfants);
        if (result.length > 0) return result;
      }
    }
    // Si pas trouve dans les enfants, c'est une racine
    if (liste.some((a) => a.id === id)) {
      return liste;
    }
    return [];
  };

  const handleMonter = async (activite: Activite) => {
    const freres = trouverFreres(activite.id);
    const index = freres.findIndex((f) => f.id === activite.id);
    if (index <= 0) return;

    const parentId = trouverParentId(activite.id);

    try {
      await moveActivity({
        variables: {
          id: activite.id,
          parentId: parentId,
          ordre: freres[index - 1].ordre,
        },
      });
      refetch();
    } catch (err) {
      console.error('Erreur deplacement:', err);
    }
  };

  const handleDescendre = async (activite: Activite) => {
    const freres = trouverFreres(activite.id);
    const index = freres.findIndex((f) => f.id === activite.id);
    if (index >= freres.length - 1) return;

    const parentId = trouverParentId(activite.id);

    try {
      await moveActivity({
        variables: {
          id: activite.id,
          parentId: parentId,
          ordre: freres[index + 1].ordre,
        },
      });
      refetch();
    } catch (err) {
      console.error('Erreur deplacement:', err);
    }
  };

  const handleDeplacerVersParent = async (nouveauParentId: string | null) => {
    if (!activiteADeplacer) return;
    try {
      await moveActivity({
        variables: {
          id: activiteADeplacer.id,
          parentId: nouveauParentId,
          ordre: 0,
        },
      });
      setActiviteADeplacer(null);
      refetch();
    } catch (err) {
      console.error('Erreur deplacement:', err);
    }
  };

  // Determiner estPremier/estDernier pour chaque element aplati
  const estPremierDansFreres = (index: number): boolean => {
    if (index === 0) return true;
    const element = listeAplatie[index];
    const precedent = listeAplatie[index - 1];
    // Premier si le precedent a un niveau inferieur (= parent different)
    return precedent.niveau < element.niveau;
  };

  const estDernierDansFreres = (index: number): boolean => {
    if (index === listeAplatie.length - 1) return true;
    const element = listeAplatie[index];
    const suivant = listeAplatie[index + 1];
    // Dernier si le suivant a un niveau inferieur ou egal mais parent different
    return suivant.niveau <= element.niveau && suivant.parentId !== element.parentId;
  };

  return (
    <div className="space-y-4">
      <NavAdmin />

      {/* En-tete */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activites</h1>
          <p className="text-sm text-gray-500">Arborescence des types d'activites</p>
        </div>
        {vueActive === 'arbre' && (
          <button
            onClick={() => ouvrirCreation(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            Nouvelle activite racine
          </button>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => { setVueActive('arbre'); refetch(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            vueActive === 'arbre'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Vue arbre
        </button>
        <button
          onClick={() => { setVueActive('texte'); refetch(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            vueActive === 'texte'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Vue texte
        </button>
      </div>

      {/* Vue texte */}
      {vueActive === 'texte' && (
        <VueTexteActivites activites={activites} onAppliquer={() => refetch()} />
      )}

      {/* Arborescence avec DnD */}
      {vueActive === 'arbre' && <><div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && activites.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : activites.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune activite</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={listeAplatie.map((e) => e.activite.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y-0">
                {listeAplatie.map((element, index) => (
                  <LigneActiviteDnd
                    key={element.activite.id}
                    activite={element.activite}
                    niveau={element.niveau}
                    ouverts={ouverts}
                    toggleOuvert={toggleOuvert}
                    onEditer={ouvrirEdition}
                    onSupprimer={setConfirmationSuppression}
                    onAjouterEnfant={ouvrirCreation}
                    onMonter={handleMonter}
                    onDescendre={handleDescendre}
                    onDeplacer={setActiviteADeplacer}
                    estPremier={estPremierDansFreres(index)}
                    estDernier={estDernierDansFreres(index)}
                    activeDragId={activeDragId}
                    infoDrop={infoDrop}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Overlay de drag */}
            <DragOverlay>
              {activeDrag ? <DragPreview activite={activeDrag as Activite} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Legende */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <LockClosedIcon className="w-4 h-4 text-orange-500" />
          Activite systeme (non modifiable)
        </span>
        <span className="flex items-center gap-1">
          <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded">Saisissable</span>
          = feuille (pas d'enfant)
        </span>
      </div>
      </>}

      {/* Modal formulaire */}
      <FormulaireActivite
        ouvert={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        onSuccess={() => refetch()}
        activite={activiteEditee}
        parentId={parentIdPourCreation}
      />

      {/* Modal deplacement */}
      {activiteADeplacer && (
        <SelectionParentModal
          ouverte={!!activiteADeplacer}
          onFermer={() => setActiviteADeplacer(null)}
          activite={activiteADeplacer}
          arbre={activites}
          onDeplacer={handleDeplacerVersParent}
        />
      )}

      {/* Modal confirmation suppression */}
      {confirmationSuppression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-4">
              Voulez-vous vraiment supprimer l'activite <strong>{confirmationSuppression.nom}</strong> ?
              {confirmationSuppression.enfants && confirmationSuppression.enfants.length > 0 && (
                <span className="block mt-2 text-orange-600">
                  Attention : cette activite a {confirmationSuppression.enfants.length} sous-activite(s).
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmationSuppression(null)}
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
