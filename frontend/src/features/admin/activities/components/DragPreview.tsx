import { LockClosedIcon, Bars3Icon } from '@heroicons/react/24/outline';
import type { Activite } from '../types';

export function DragPreview({
  activite,
}: {
  activite: Pick<Activite, 'nom' | 'code' | 'estSysteme'>;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[1.2rem] border border-[color:var(--sand-accent)]/30 bg-white/95 px-3 py-2 opacity-95 shadow-[0_20px_45px_-28px_rgba(52,78,65,0.8)] backdrop-blur">
      <Bars3Icon className="w-4 h-4 text-[color:var(--sand-muted)]" />
      <span className="font-medium text-[color:var(--sand-ink)]">{activite.nom}</span>
      {activite.code && (
        <span className="rounded-full bg-[color:var(--sand-surface-strong)] px-1.5 py-0.5 text-xs text-[color:var(--sand-muted)]">
          {activite.code}
        </span>
      )}
      {activite.estSysteme && (
        <LockClosedIcon className="w-4 h-4 text-orange-500" />
      )}
    </div>
  );
}
