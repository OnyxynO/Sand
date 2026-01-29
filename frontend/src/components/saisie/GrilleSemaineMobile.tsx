// Vue mobile de la grille de saisie (cartes par jour)

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSaisieStore } from '../../stores/saisieStore';
import { formatDuree, parseDuree } from '../../utils/semaineUtils';
import SelecteurProjetActivite from './SelecteurProjetActivite';
import type { JourSemaine } from '../../types';

// Carte pour un jour
function CarteJour({ jour }: { jour: JourSemaine }) {
  const { lignes, getTotalJour, modifierCellule } = useSaisieStore();
  const [ouverte, setOuverte] = useState(jour.estAujourdhui);

  const total = getTotalJour(jour.dateStr);
  const estWarning = total > 0 && Math.abs(total - 1.0) >= 0.001;

  // Formater le nom du jour avec majuscule
  const jourNomCapitalize = jour.jourComplet.charAt(0).toUpperCase() + jour.jourComplet.slice(1);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${
        jour.estAujourdhui ? 'ring-2 ring-blue-300' : ''
      }`}
    >
      {/* En-tete de la carte */}
      <button
        onClick={() => setOuverte(!ouverte)}
        className={`w-full flex items-center justify-between px-4 py-3 ${
          jour.estFutur ? 'bg-gray-100 text-gray-400' : 'bg-gray-50'
        }`}
        disabled={jour.estFutur}
      >
        <span className="font-medium">{jourNomCapitalize}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded ${
              estWarning
                ? 'bg-orange-100 text-orange-700'
                : total > 0
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500'
            }`}
          >
            {formatDuree(total) || '0'} ETP
          </span>
          {!jour.estFutur &&
            (ouverte ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            ))}
        </div>
      </button>

      {/* Contenu depliable */}
      {ouverte && !jour.estFutur && (
        <div className="divide-y">
          {lignes.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-500 text-center">Aucune ligne de saisie</p>
          ) : (
            lignes.map((ligne) => {
              const cellule = ligne.saisies[jour.dateStr];
              const valeur = cellule?.duree;

              return (
                <div key={ligne.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                          {ligne.projetCode}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {ligne.activiteNom}
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formatDuree(valeur)}
                      onChange={(e) => {
                        const nouvelleDuree = parseDuree(e.target.value);
                        // Permettre valeur vide ou valide
                        if (e.target.value === '' || nouvelleDuree !== null) {
                          modifierCellule(ligne.id, jour.dateStr, nouvelleDuree);
                        }
                      }}
                      placeholder="0.00"
                      className={`w-16 h-9 text-center text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        cellule?.estModifiee ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function GrilleSemaineMobile() {
  const { jours, chargement } = useSaisieStore();
  const [modaleOuverte, setModaleOuverte] = useState(false);

  if (chargement) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Bouton ajouter en haut sur mobile */}
        <button
          onClick={() => setModaleOuverte(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 rounded-lg shadow-sm border border-dashed border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">Ajouter une ligne</span>
        </button>

        {/* Cartes par jour */}
        {jours.map((jour) => (
          <CarteJour key={jour.dateStr} jour={jour} />
        ))}
      </div>

      <SelecteurProjetActivite
        ouvert={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
      />
    </>
  );
}
