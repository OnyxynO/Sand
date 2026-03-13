import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  LockClosedIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import type { Activite } from '../types';
import type { ActiviteDnd, InfoDrop } from '../../../../hooks/useArbreDnd';

export function LigneActiviteDnd({
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
  activite: ActiviteDnd;
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
          className="absolute left-0 right-0 top-0 z-10 h-0.5 bg-[color:var(--sand-accent-strong)]"
          style={{ marginLeft: `${niveau * 24 + 12}px` }}
        />
      )}

      <div
        className={`group flex items-center gap-2 border-b border-[color:var(--sand-line)] px-3 py-2 transition hover:bg-[color:var(--sand-surface-strong)] ${
          !activite.estActif ? 'opacity-50' : ''
        } ${typeDrop === 'devenir-enfant' ? 'bg-[color:var(--sand-accent)]/10 ring-2 ring-[color:var(--sand-accent)]/40 ring-inset' : ''}`}
        style={{ paddingLeft: `${niveau * 24 + 12}px` }}
      >
        {/* Poignee de drag */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-full p-0.5 opacity-0 transition group-hover:opacity-100 hover:bg-[color:var(--sand-surface-strong)] touch-none"
          title="Glisser pour deplacer"
          data-testid={`drag-handle-${activite.id}`}
        >
          <Bars3Icon className="w-4 h-4 text-[color:var(--sand-muted)]" />
        </button>

        {/* Chevron */}
        <button
          onClick={() => toggleOuvert(activite.id)}
          className={`rounded-full p-0.5 ${aEnfants ? 'hover:bg-[color:var(--sand-surface-strong)]' : 'invisible'}`}
          disabled={!aEnfants}
        >
          {estOuvert ? (
            <ChevronDownIcon className="w-4 h-4 text-[color:var(--sand-muted)]" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-[color:var(--sand-muted)]" />
          )}
        </button>

        {/* Nom et code */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[color:var(--sand-ink)]">{activite.nom}</span>
            {activite.code && (
              <span className="rounded-full bg-[color:var(--sand-surface-strong)] px-1.5 py-0.5 text-xs text-[color:var(--sand-muted)]">
                {activite.code}
              </span>
            )}
            {activite.estSysteme && (
              <LockClosedIcon className="w-4 h-4 text-orange-500" title="Activite systeme" />
            )}
            {activite.estFeuille && (
              <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-xs text-green-600">
                Saisissable
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
          {/* Monter/Descendre */}
          <button
            onClick={() => onMonter(activite)}
            disabled={estPremier}
            className="rounded-full p-1 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-ink)] disabled:opacity-30"
            title="Monter"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDescendre(activite)}
            disabled={estDernier}
            className="rounded-full p-1 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-ink)] disabled:opacity-30"
            title="Descendre"
          >
            <ArrowDownIcon className="w-4 h-4" />
          </button>

          {/* Deplacer */}
          {!activite.estSysteme && (
            <button
              onClick={() => onDeplacer(activite)}
              className="rounded-full p-1 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-accent-strong)]"
              title="Deplacer vers un autre parent"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}

          {/* Ajouter enfant */}
          <button
            onClick={() => onAjouterEnfant(activite.id)}
            className="rounded-full p-1 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-green-700"
            title="Ajouter une sous-activite"
          >
            <PlusIcon className="w-4 h-4" />
          </button>

          {/* Editer */}
          {!activite.estSysteme && (
            <button
              onClick={() => onEditer(activite)}
              className="rounded-full p-1 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-[color:var(--sand-accent-strong)]"
              title="Modifier"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          )}

          {/* Supprimer */}
          {!activite.estSysteme && (
            <button
              onClick={() => onSupprimer(activite)}
              className="rounded-full p-1 text-[color:var(--sand-muted)] transition hover:bg-[color:var(--sand-surface-strong)] hover:text-red-600"
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
