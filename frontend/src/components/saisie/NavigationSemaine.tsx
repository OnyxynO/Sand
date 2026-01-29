// Composant de navigation entre les semaines

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSaisieStore } from '../../stores/saisieStore';
import { formatSemainePourAffichage, estSemaineCourante } from '../../utils/semaineUtils';

export default function NavigationSemaine() {
  const { semaineISO, allerSemainePrecedente, allerSemaineSuivante, allerSemaineActuelle } =
    useSaisieStore();

  const estCourante = estSemaineCourante(semaineISO);

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      {/* Boutons de navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={allerSemainePrecedente}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Semaine precedente"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={allerSemaineSuivante}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Semaine suivante"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>

        {!estCourante && (
          <button
            onClick={allerSemaineActuelle}
            className="ml-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Aujourd'hui
          </button>
        )}
      </div>

      {/* Titre de la semaine */}
      <h2 className="text-lg font-semibold text-gray-900">
        {formatSemainePourAffichage(semaineISO)}
      </h2>

      {/* Espace pour equilibrer */}
      <div className="w-32" />
    </div>
  );
}
