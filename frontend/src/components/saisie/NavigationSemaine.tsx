// Composant de navigation entre les semaines

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSaisieStore } from '../../stores/saisieStore';
import { formatSemainePourAffichage, estSemaineCourante } from '../../utils/semaineUtils';

export default function NavigationSemaine() {
  const { semaineISO, allerSemainePrecedente, allerSemaineSuivante, allerSemaineActuelle } =
    useSaisieStore();

  const estCourante = estSemaineCourante(semaineISO);

  return (
    <div className="sand-card flex items-center justify-between rounded-[26px] px-5 py-4">
      {/* Boutons de navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={allerSemainePrecedente}
          className="rounded-full border border-[var(--sand-line)] bg-white/80 p-2.5 transition-colors hover:border-[var(--sand-accent)] hover:text-[var(--sand-accent)] focus-visible:ring-2 focus-visible:ring-[var(--sand-accent)]"
          aria-label="Semaine précédente"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>

        <button
          onClick={allerSemaineSuivante}
          className="rounded-full border border-[var(--sand-line)] bg-white/80 p-2.5 transition-colors hover:border-[var(--sand-accent)] hover:text-[var(--sand-accent)] focus-visible:ring-2 focus-visible:ring-[var(--sand-accent)]"
          aria-label="Semaine suivante"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>

        {!estCourante && (
          <button
            onClick={allerSemaineActuelle}
            className="ml-2 rounded-full bg-[var(--sand-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--sand-accent)] transition-colors hover:bg-[var(--sand-accent)] hover:text-white"
          >
            Aujourd'hui
          </button>
        )}
      </div>

      {/* Titre de la semaine */}
      <h2 className="sand-display text-2xl text-gray-900">
        {formatSemainePourAffichage(semaineISO)}
      </h2>

      {/* Espace pour equilibrer */}
      <div className="w-32" />
    </div>
  );
}
