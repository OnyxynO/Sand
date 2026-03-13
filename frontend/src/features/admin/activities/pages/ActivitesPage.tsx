// Page de gestion de l'arborescence des activites (Admin)

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  PlusIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {
  ARBRE_ACTIVITES,
  DELETE_ACTIVITY,
  MOVE_ACTIVITY,
} from '../../../../graphql/operations/activities';
import NavAdmin from '../../../../components/admin/NavAdmin';
import SelectionParentModal from '../../../../components/admin/SelectionParentModal';
import VueTexteActivites from '../../../../components/admin/VueTexteActivites';
import useArbreDnd from '../../../../hooks/useArbreDnd';
import { LigneActiviteDnd } from '../components/LigneActiviteDnd';
import { DragPreview } from '../components/DragPreview';
import { FormulaireActivite } from '../components/FormulaireActivite';
import type { Activite } from '../types';

export default function ActivitesPage() {
  const [vueActive, setVueActive] = useState<'arbre' | 'texte'>('arbre');
  const [ouverts, setOuverts] = useState<Set<string>>(new Set());
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [activiteEditee, setActiviteEditee] = useState<Activite | null>(null);
  const [parentIdPourCreation, setParentIdPourCreation] = useState<string | null>(null);
  const [confirmationSuppression, setConfirmationSuppression] = useState<Activite | null>(null);
  const [erreurSuppression, setErreurSuppression] = useState('');
  const [erreurDeplacement, setErreurDeplacement] = useState('');
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
      setErreurSuppression('');
      refetch();
    } catch (err) {
      setErreurSuppression(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  // Trouver le parent d'une activite (retourne null si racine)
  const trouverParentId = (id: string, liste: Activite[] = activites): string | null => {
    for (const a of liste) {
      if (a.enfants?.some((e) => e.id === id)) {
        return a.id;
      }
      if (a.enfants) {
        const result = trouverParentId(id, a.enfants);
        if (result !== null) return result;
      }
    }
    return null;
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
      await moveActivity({ variables: { id: activite.id, parentId, ordre: freres[index - 1].ordre } });
      refetch();
    } catch (err) {
      setErreurDeplacement(err instanceof Error ? err.message : 'Erreur lors du déplacement.');
    }
  };

  const handleDescendre = async (activite: Activite) => {
    const freres = trouverFreres(activite.id);
    const index = freres.findIndex((f) => f.id === activite.id);
    if (index >= freres.length - 1) return;
    const parentId = trouverParentId(activite.id);
    try {
      await moveActivity({ variables: { id: activite.id, parentId, ordre: freres[index + 1].ordre } });
      refetch();
    } catch (err) {
      setErreurDeplacement(err instanceof Error ? err.message : 'Erreur lors du déplacement.');
    }
  };

  const handleDeplacerVersParent = async (nouveauParentId: string | null) => {
    if (!activiteADeplacer) return;
    try {
      await moveActivity({ variables: { id: activiteADeplacer.id, parentId: nouveauParentId, ordre: 0 } });
      setActiviteADeplacer(null);
      refetch();
    } catch (err) {
      setErreurDeplacement(err instanceof Error ? err.message : 'Erreur lors du déplacement.');
    }
  };

  // Determiner estPremier/estDernier pour chaque element aplati
  const estPremierDansFreres = (index: number): boolean => {
    if (index === 0) return true;
    const element = listeAplatie[index];
    const precedent = listeAplatie[index - 1];
    return precedent.niveau < element.niveau;
  };

  const estDernierDansFreres = (index: number): boolean => {
    if (index === listeAplatie.length - 1) return true;
    const element = listeAplatie[index];
    const suivant = listeAplatie[index + 1];
    return suivant.niveau <= element.niveau && suivant.parentId !== element.parentId;
  };

  return (
    <div className="space-y-4">
      <NavAdmin />

      {/* En-tete */}
      <div className="sand-card flex items-center justify-between rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(52,78,65,0.08),rgba(238,154,104,0.14))] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-muted)]">Administration</p>
          <h1 className="font-['Fraunces',serif] text-3xl text-[color:var(--sand-ink)]">Activites</h1>
          <p className="text-sm text-[color:var(--sand-muted)]">Arborescence des types d'activites</p>
        </div>
        {vueActive === 'arbre' && (
          <button
            onClick={() => ouvrirCreation(null)}
            className="flex items-center gap-2 rounded-full bg-[color:var(--sand-ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--sand-accent-strong)]"
          >
            <PlusIcon className="w-4 h-4" />
            Nouvelle activite racine
          </button>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-2 overflow-x-auto rounded-[1.4rem] border border-[color:var(--sand-line)] bg-white/70 p-2 shadow-[0_20px_50px_-45px_rgba(52,78,65,0.7)] backdrop-blur">
        <button
          onClick={() => { setVueActive('arbre'); refetch(); }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            vueActive === 'arbre'
              ? 'bg-[color:var(--sand-ink)] text-white'
              : 'text-[color:var(--sand-muted)] hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-ink)]'
          }`}
        >
          Vue arbre
        </button>
        <button
          onClick={() => { setVueActive('texte'); refetch(); }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            vueActive === 'texte'
              ? 'bg-[color:var(--sand-ink)] text-white'
              : 'text-[color:var(--sand-muted)] hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-ink)]'
          }`}
        >
          Vue texte
        </button>
      </div>

      {/* Vue texte */}
      {vueActive === 'texte' && (
        <VueTexteActivites activites={activites} onAppliquer={() => refetch()} />
      )}

      {/* Erreur deplacement */}
      {erreurDeplacement && (
        <div className="flex items-center justify-between rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{erreurDeplacement}</span>
          <button onClick={() => setErreurDeplacement('')} className="ml-4 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Arborescence avec DnD */}
      {vueActive === 'arbre' && (
        <>
          <div className="sand-card overflow-hidden rounded-[1.8rem]">
            {loading && activites.length === 0 ? (
              <div className="p-8 text-center text-[color:var(--sand-muted)]">Chargement...</div>
            ) : activites.length === 0 ? (
              <div className="p-8 text-center text-[color:var(--sand-muted)]">Aucune activite</div>
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

                <DragOverlay>
                  {activeDrag ? <DragPreview activite={activeDrag as Activite} /> : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* Legende */}
          <div className="flex items-center gap-4 text-xs text-[color:var(--sand-muted)]">
            <span className="flex items-center gap-1">
              <LockClosedIcon className="w-4 h-4 text-orange-500" />
              Activite systeme (non modifiable)
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded">Saisissable</span>
              = feuille (pas d'enfant)
            </span>
          </div>
        </>
      )}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sand-ink)]/35">
          <div className="mx-4 w-full max-w-sm rounded-[1.8rem] border border-white/70 bg-white/95 p-6 shadow-[0_32px_70px_-40px_rgba(52,78,65,0.8)] backdrop-blur">
            <h3 className="mb-2 font-['Fraunces',serif] text-2xl text-[color:var(--sand-ink)]">Confirmer la suppression</h3>
            <p className="mb-4 text-sm text-[color:var(--sand-muted)]">
              Voulez-vous vraiment supprimer l'activite <strong>{confirmationSuppression.nom}</strong> ?
              {confirmationSuppression.enfants && confirmationSuppression.enfants.length > 0 && (
                <span className="block mt-2 text-orange-600">
                  Attention : cette activite a {confirmationSuppression.enfants.length} sous-activite(s).
                </span>
              )}
            </p>
            {erreurSuppression && (
              <p className="text-sm text-red-600 mb-3">{erreurSuppression}</p>
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
