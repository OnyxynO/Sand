// Modale de selection du nouveau parent pour deplacer une activite

import { Fragment, useState, useMemo } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Activite {
  id: string;
  nom: string;
  code?: string;
  niveau: number;
  estSysteme: boolean;
  enfants?: Activite[];
}

interface SelectionParentModalProps {
  ouverte: boolean;
  onFermer: () => void;
  activite: Activite;
  arbre: Activite[];
  onDeplacer: (nouveauParentId: string | null) => void;
}

// Collecte les IDs d'une activite et tous ses descendants
function collecterDescendantIds(activite: Activite): Set<string> {
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

// Aplatit l'arbre en liste avec niveau
function aplatirArbre(activites: Activite[]): Activite[] {
  const resultat: Activite[] = [];
  const parcourir = (liste: Activite[]) => {
    for (const a of liste) {
      resultat.push(a);
      if (a.enfants) parcourir(a.enfants);
    }
  };
  parcourir(activites);
  return resultat;
}

// Trouve le parent ID d'une activite dans l'arbre
function trouverParentId(
  activiteId: string,
  arbre: Activite[],
): string | null {
  for (const a of arbre) {
    if (a.enfants?.some((e) => e.id === activiteId)) {
      return a.id;
    }
    if (a.enfants) {
      const result = trouverParentId(activiteId, a.enfants);
      if (result !== null) return result;
    }
  }
  return null;
}

export default function SelectionParentModal({
  ouverte,
  onFermer,
  activite,
  arbre,
  onDeplacer,
}: SelectionParentModalProps) {
  const [recherche, setRecherche] = useState('');
  const [selectionId, setSelectionId] = useState<string | null | undefined>(
    undefined,
  );

  // IDs a desactiver : l'activite elle-meme + ses descendants
  const idsDesactives = useMemo(
    () => collecterDescendantIds(activite),
    [activite],
  );

  // Parent actuel
  const parentActuelId = useMemo(
    () => trouverParentId(activite.id, arbre),
    [activite.id, arbre],
  );

  // Liste aplatie et filtree
  const listeAffichee = useMemo(() => {
    const liste = aplatirArbre(arbre);
    if (!recherche.trim()) return liste;
    const terme = recherche.toLowerCase();
    return liste.filter(
      (a) =>
        a.nom.toLowerCase().includes(terme) ||
        (a.code && a.code.toLowerCase().includes(terme)),
    );
  }, [arbre, recherche]);

  const handleDeplacer = () => {
    if (selectionId === undefined) return;
    onDeplacer(selectionId);
    setRecherche('');
    setSelectionId(undefined);
  };

  const handleFermer = () => {
    setRecherche('');
    setSelectionId(undefined);
    onFermer();
  };

  return (
    <Transition show={ouverte} as={Fragment}>
      <Dialog onClose={handleFermer} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Deplacer {activite.nom}
                  </DialogTitle>
                  <button
                    onClick={handleFermer}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Recherche */}
                <div className="px-4 pt-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={recherche}
                      onChange={(e) => setRecherche(e.target.value)}
                      placeholder="Rechercher une activite..."
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Liste des parents possibles */}
                <div className="px-4 py-3 max-h-80 overflow-y-auto">
                  {/* Option racine */}
                  <button
                    onClick={() => setSelectionId(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                      selectionId === null
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : parentActuelId === null
                          ? 'bg-gray-50 text-gray-500'
                          : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">Racine (niveau 0)</span>
                    {parentActuelId === null && (
                      <span className="ml-2 text-xs text-gray-400">
                        (actuel)
                      </span>
                    )}
                  </button>

                  {/* Activites */}
                  {listeAffichee.map((a) => {
                    const estDesactive = idsDesactives.has(a.id);
                    const estParentActuel = a.id === parentActuelId;
                    const estSelectionne = selectionId === a.id;

                    return (
                      <button
                        key={a.id}
                        onClick={() => !estDesactive && setSelectionId(a.id)}
                        disabled={estDesactive}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                          estDesactive
                            ? 'opacity-40 cursor-not-allowed'
                            : estSelectionne
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : estParentActuel
                                ? 'bg-gray-50 text-gray-500'
                                : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        style={{ paddingLeft: `${a.niveau * 20 + 12}px` }}
                        data-testid={`parent-option-${a.id}`}
                      >
                        <span>{a.nom}</span>
                        {a.code && (
                          <span className="ml-1.5 text-xs text-gray-400">
                            ({a.code})
                          </span>
                        )}
                        {estParentActuel && (
                          <span className="ml-2 text-xs text-gray-400">
                            (actuel)
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {listeAffichee.length === 0 && recherche && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aucune activite trouvee
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 px-4 py-3 border-t">
                  <button
                    type="button"
                    onClick={handleFermer}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleDeplacer}
                    disabled={selectionId === undefined}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Deplacer
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
