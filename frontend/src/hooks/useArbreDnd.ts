// Hook encapsulant la logique drag-and-drop pour l'arbre d'activites
// Utilise @dnd-kit pour le DnD accessible (clavier + lecteurs d'ecran)

import { useState, useMemo, useCallback } from 'react';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';

export interface ActiviteDnd {
  id: string;
  nom: string;
  code?: string;
  chemin: string;
  niveau: number;
  ordre: number;
  estFeuille: boolean;
  estSysteme: boolean;
  estActif: boolean;
  enfants?: ActiviteDnd[];
}

export interface ElementAplati {
  activite: ActiviteDnd;
  niveau: number;
  parentId: string | null;
}

// Type de zone de drop
export type TypeDrop = 'entre-freres' | 'devenir-enfant' | null;

export interface InfoDrop {
  type: TypeDrop;
  cibleId: string | null;
  parentId: string | null;
  ordre: number;
}

export interface ResultatDnd {
  // Liste aplatie pour le rendu
  listeAplatie: ElementAplati[];
  // ID de l'element en cours de drag
  activeDragId: string | null;
  activeDrag: ActiviteDnd | null;
  // Info sur la zone de drop actuelle
  infoDrop: InfoDrop | null;
  // Handlers
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

// Collecte les IDs d'une activite et tous ses descendants
export function collecterDescendantIds(activite: ActiviteDnd): Set<string> {
  const ids = new Set<string>([activite.id]);
  if (activite.enfants) {
    for (const enfant of activite.enfants) {
      for (const id of collecterDescendantIds(enfant)) {
        ids.add(id);
      }
    }
  }
  return ids;
}

// Aplatit l'arbre en respectant l'etat ouverts/fermes
export function aplatirArbre(
  activites: ActiviteDnd[],
  ouverts: Set<string>,
  parentId: string | null = null,
): ElementAplati[] {
  const resultat: ElementAplati[] = [];
  for (const activite of activites) {
    resultat.push({ activite, niveau: activite.niveau, parentId });
    if (activite.enfants && activite.enfants.length > 0 && ouverts.has(activite.id)) {
      resultat.push(...aplatirArbre(activite.enfants, ouverts, activite.id));
    }
  }
  return resultat;
}

// Trouve une activite par ID dans l'arbre
function trouverActivite(id: string, activites: ActiviteDnd[]): ActiviteDnd | null {
  for (const a of activites) {
    if (a.id === id) return a;
    if (a.enfants) {
      const trouve = trouverActivite(id, a.enfants);
      if (trouve) return trouve;
    }
  }
  return null;
}

// Trouve le parent d'une activite
function trouverParentId(id: string, activites: ActiviteDnd[]): string | null {
  for (const a of activites) {
    if (a.enfants?.some((e) => e.id === id)) return a.id;
    if (a.enfants) {
      const result = trouverParentId(id, a.enfants);
      if (result !== null) return result;
    }
  }
  return null;
}

// Valide si un drop est autorise
export function validerDrop(
  draggedId: string,
  cibleId: string,
  type: TypeDrop,
  arbre: ActiviteDnd[],
): boolean {
  if (!type) return false;
  if (draggedId === cibleId) return false;

  const dragged = trouverActivite(draggedId, arbre);
  if (!dragged) return false;

  // Anti-cycle : la cible ne doit pas etre un descendant du dragged
  const descendantIds = collecterDescendantIds(dragged);
  if (descendantIds.has(cibleId)) return false;

  // Activite systeme : reparentage interdit
  if (type === 'devenir-enfant' && dragged.estSysteme) {
    const parentActuel = trouverParentId(draggedId, arbre);
    // Devenir enfant de cibleId = changement de parent
    if (parentActuel !== cibleId) return false;
  }

  return true;
}

// Calcule le parentId et l'ordre pour un drop entre freres
export function calculerDropEntreFreres(
  draggedId: string,
  cibleId: string,
  arbre: ActiviteDnd[],
  listeAplatie: ElementAplati[],
): { parentId: string | null; ordre: number } | null {
  const indexCible = listeAplatie.findIndex((e) => e.activite.id === cibleId);
  if (indexCible < 0) return null;

  const cible = listeAplatie[indexCible];
  const parentId = cible.parentId;

  // Trouver les freres dans ce parent
  const freres = parentId
    ? trouverActivite(parentId, arbre)?.enfants || []
    : arbre;

  const indexDansFreres = freres.findIndex((f) => f.id === cibleId);
  if (indexDansFreres < 0) return null;

  // Inserer apres la cible
  const ordreCible = freres[indexDansFreres].ordre;

  // Verifier si le dragged est deja un frere et est avant la cible
  const indexDragged = freres.findIndex((f) => f.id === draggedId);
  if (indexDragged >= 0 && indexDragged < indexDansFreres) {
    // Le dragged est avant la cible, prendre l'ordre de la cible
    return { parentId, ordre: ordreCible };
  }

  // Sinon, inserer apres la cible : prendre l'ordre apres
  if (indexDansFreres < freres.length - 1) {
    return { parentId, ordre: ordreCible + 1 };
  }

  return { parentId, ordre: ordreCible + 1 };
}

export default function useArbreDnd(
  arbre: ActiviteDnd[],
  ouverts: Set<string>,
  onMoveActivity: (id: string, parentId: string | null, ordre: number) => Promise<void>,
): ResultatDnd {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [infoDrop, setInfoDrop] = useState<InfoDrop | null>(null);

  const listeAplatie = useMemo(
    () => aplatirArbre(arbre, ouverts),
    [arbre, ouverts],
  );

  const activeDrag = useMemo(() => {
    if (!activeDragId) return null;
    return trouverActivite(activeDragId, arbre);
  }, [activeDragId, arbre]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
    setInfoDrop(null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) {
        setInfoDrop(null);
        return;
      }

      const draggedId = String(active.id);
      const overId = String(over.id);

      if (draggedId === overId) {
        setInfoDrop(null);
        return;
      }

      // Determiner le type de drop selon la position verticale du curseur
      // sur l'element cible : haut/bas = entre freres, centre = devenir enfant
      const rect = over.rect;
      const pointerY = event.activatorEvent instanceof PointerEvent
        ? event.activatorEvent.clientY + (event.delta?.y || 0)
        : 0;

      // Si on n'a pas de coordonnees, defaut sur "entre-freres"
      let type: TypeDrop;
      if (rect && pointerY) {
        const seuil = rect.height * 0.25;
        const offsetY = pointerY - rect.top;
        if (offsetY < seuil) {
          type = 'entre-freres';
        } else if (offsetY > rect.height - seuil) {
          type = 'entre-freres';
        } else {
          type = 'devenir-enfant';
        }
      } else {
        type = 'entre-freres';
      }

      // Valider le drop
      if (!validerDrop(draggedId, overId, type, arbre)) {
        // Essayer l'autre type
        const autreType: TypeDrop = type === 'entre-freres' ? 'devenir-enfant' : 'entre-freres';
        if (validerDrop(draggedId, overId, autreType, arbre)) {
          type = autreType;
        } else {
          setInfoDrop(null);
          return;
        }
      }

      if (type === 'devenir-enfant') {
        setInfoDrop({
          type: 'devenir-enfant',
          cibleId: overId,
          parentId: overId,
          ordre: 0,
        });
      } else {
        const result = calculerDropEntreFreres(draggedId, overId, arbre, listeAplatie);
        if (result) {
          setInfoDrop({
            type: 'entre-freres',
            cibleId: overId,
            parentId: result.parentId,
            ordre: result.ordre,
          });
        } else {
          setInfoDrop(null);
        }
      }
    },
    [arbre, listeAplatie],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);

      if (!over || !infoDrop) {
        setInfoDrop(null);
        return;
      }

      const draggedId = String(active.id);

      // Verifier que le drop n'est pas sur soi-meme sans changement
      if (draggedId === String(over.id)) {
        setInfoDrop(null);
        return;
      }

      try {
        await onMoveActivity(draggedId, infoDrop.parentId, infoDrop.ordre);
      } catch {
        // Le deplacement est annule : le DnD revient visuellement a sa position initiale
      }

      setInfoDrop(null);
    },
    [infoDrop, onMoveActivity],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    setInfoDrop(null);
  }, []);

  return {
    listeAplatie,
    activeDragId,
    activeDrag,
    infoDrop,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
