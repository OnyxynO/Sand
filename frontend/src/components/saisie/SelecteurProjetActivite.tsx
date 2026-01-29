// Modale pour selectionner un projet puis une activite

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { PROJETS_ACTIFS, ACTIVITES_DISPONIBLES } from '../../graphql/operations/saisie';
import { useSaisieStore } from '../../stores/saisieStore';
import type { ProjetDisponible, ActiviteDisponible } from '../../types';

interface SelecteurProjetActiviteProps {
  ouvert: boolean;
  onFermer: () => void;
}

export default function SelecteurProjetActivite({
  ouvert,
  onFermer,
}: SelecteurProjetActiviteProps) {
  const { ajouterLigne, lignes } = useSaisieStore();

  // Etape : 'projet' ou 'activite'
  const [etape, setEtape] = useState<'projet' | 'activite'>('projet');
  const [projetSelectionne, setProjetSelectionne] = useState<ProjetDisponible | null>(null);
  const [recherche, setRecherche] = useState('');

  // Charger les projets
  const { data: dataProjets, loading: loadingProjets } = useQuery<{
    projets: ProjetDisponible[];
  }>(PROJETS_ACTIFS, {
    skip: !ouvert,
  });

  // Charger les activites quand un projet est selectionne
  const [fetchActivites, { data: dataActivites, loading: loadingActivites }] = useLazyQuery<{
    activitesDisponibles: ActiviteDisponible[];
  }>(ACTIVITES_DISPONIBLES);

  // Reset a la fermeture
  useEffect(() => {
    if (!ouvert) {
      setEtape('projet');
      setProjetSelectionne(null);
      setRecherche('');
    }
  }, [ouvert]);

  // Charger les activites quand on selectionne un projet
  useEffect(() => {
    if (projetSelectionne) {
      fetchActivites({ variables: { projetId: projetSelectionne.id } });
    }
  }, [projetSelectionne, fetchActivites]);

  // Filtrer les projets
  const projetsFiltres = dataProjets?.projets?.filter((p) => {
    const terme = recherche.toLowerCase();
    return (
      p.nom.toLowerCase().includes(terme) ||
      p.code.toLowerCase().includes(terme)
    );
  }) || [];

  // Filtrer les activites (seulement les feuilles, et exclure celles deja ajoutees)
  const activitesFiltrees = dataActivites?.activitesDisponibles?.filter((a) => {
    // Seulement les feuilles actives
    if (!a.estFeuille || !a.estActif) return false;

    // Exclure si deja dans la grille pour ce projet
    const ligneExistante = lignes.some(
      (l) => l.projetId === projetSelectionne?.id && l.activiteId === a.id
    );
    if (ligneExistante) return false;

    // Filtrer par recherche
    const terme = recherche.toLowerCase();
    return (
      a.nom.toLowerCase().includes(terme) ||
      a.cheminComplet.toLowerCase().includes(terme)
    );
  }) || [];

  // Selection d'un projet
  const handleSelectProjet = (projet: ProjetDisponible) => {
    setProjetSelectionne(projet);
    setEtape('activite');
    setRecherche('');
  };

  // Selection d'une activite
  const handleSelectActivite = (activite: ActiviteDisponible) => {
    if (!projetSelectionne) return;

    ajouterLigne(
      projetSelectionne.id,
      projetSelectionne.nom,
      projetSelectionne.code,
      activite.id,
      activite.nom,
      activite.cheminComplet
    );

    onFermer();
  };

  // Retour a l'etape projet
  const retourProjets = () => {
    setEtape('projet');
    setProjetSelectionne(null);
    setRecherche('');
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                {/* En-tete */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {etape === 'projet' ? 'Choisir un projet' : 'Choisir une activite'}
                  </Dialog.Title>
                  <button
                    onClick={onFermer}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Breadcrumb / retour */}
                {etape === 'activite' && projetSelectionne && (
                  <div className="px-4 py-2 bg-gray-50 border-b">
                    <button
                      onClick={retourProjets}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Changer de projet
                    </button>
                    <p className="mt-1 text-sm">
                      <span className="font-medium">{projetSelectionne.nom}</span>
                      <span className="text-gray-500"> ({projetSelectionne.code})</span>
                    </p>
                  </div>
                )}

                {/* Recherche */}
                <div className="px-4 py-3 border-b">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={recherche}
                      onChange={(e) => setRecherche(e.target.value)}
                      placeholder={
                        etape === 'projet'
                          ? 'Rechercher un projet...'
                          : 'Rechercher une activite...'
                      }
                      className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Liste */}
                <div className="max-h-80 overflow-y-auto">
                  {etape === 'projet' ? (
                    // Liste des projets
                    loadingProjets ? (
                      <div className="p-8 text-center text-gray-500">Chargement...</div>
                    ) : projetsFiltres.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">Aucun projet trouve</div>
                    ) : (
                      <ul className="divide-y">
                        {projetsFiltres.map((projet) => (
                          <li key={projet.id}>
                            <button
                              onClick={() => handleSelectProjet(projet)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                                  {projet.code}
                                </span>
                                <span className="font-medium text-gray-900">{projet.nom}</span>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )
                  ) : (
                    // Liste des activites
                    loadingActivites ? (
                      <div className="p-8 text-center text-gray-500">Chargement...</div>
                    ) : activitesFiltrees.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        {recherche
                          ? 'Aucune activite trouvee'
                          : 'Toutes les activites sont deja ajoutees'}
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {activitesFiltrees.map((activite) => (
                          <li key={activite.id}>
                            <button
                              onClick={() => handleSelectActivite(activite)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <p className="font-medium text-gray-900">{activite.nom}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{activite.cheminComplet}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>

                {/* Pied */}
                <div className="px-4 py-3 border-t bg-gray-50">
                  <button
                    onClick={onFermer}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
