import { useState, useEffect, Fragment, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import ToastAnnulation from '../../components/ui/ToastAnnulation';
import { ARBRE_ACTIVITES } from '../../graphql/operations/activities';
import { PROJET_QUERY, SET_PROJECT_ACTIVITIES } from '../../graphql/operations/projects';
import type { Activite, Projet } from './types';

function CheckboxTriState({
  checked,
  indeterminate,
  onChange,
  disabled,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`w-4 h-4 rounded border flex items-center justify-center ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        checked
          ? 'bg-blue-600 border-blue-600'
          : indeterminate
          ? 'bg-blue-300 border-blue-400'
          : 'bg-white border-gray-300 hover:border-blue-500'
      }`}
    >
      {checked && <CheckIcon className="w-3 h-3 text-white" />}
      {indeterminate && !checked && <div className="w-2 h-0.5 bg-white" />}
    </button>
  );
}

function LigneActiviteCheckbox({
  activite,
  niveau,
  selectionnees,
  onToggle,
  getEtatActivite,
}: {
  activite: Activite;
  niveau: number;
  selectionnees: Set<string>;
  onToggle: (id: string, enfantIds: string[]) => void;
  getEtatActivite: (a: Activite) => { checked: boolean; indeterminate: boolean };
}) {
  const { checked, indeterminate } = getEtatActivite(activite);
  const aEnfants = activite.enfants && activite.enfants.length > 0;

  const collecterFeuillesIds = (a: Activite): string[] => {
    if (a.estFeuille) return [a.id];
    if (!a.enfants) return [];
    return a.enfants.flatMap(collecterFeuillesIds);
  };

  return (
    <>
      <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50"
        style={{ paddingLeft: `${niveau * 20 + 8}px` }}
      >
        <CheckboxTriState
          checked={checked}
          indeterminate={indeterminate}
          onChange={() => onToggle(activite.id, collecterFeuillesIds(activite))}
          disabled={!activite.estActif}
        />
        <span className={`text-sm ${!activite.estActif ? 'text-gray-400' : ''}`}>
          {activite.nom}
        </span>
        {activite.estFeuille && (
          <span className="text-xs text-green-600 bg-green-50 px-1 rounded">saisissable</span>
        )}
      </div>
      {aEnfants &&
        activite.enfants!.map((enfant) => (
          <LigneActiviteCheckbox
            key={enfant.id}
            activite={enfant}
            niveau={niveau + 1}
            selectionnees={selectionnees}
            onToggle={onToggle}
            getEtatActivite={getEtatActivite}
          />
        ))}
    </>
  );
}

export default function ConfigActivitesModal({
  ouvert,
  onFermer,
  projet,
  onSuccess,
}: {
  ouvert: boolean;
  onFermer: () => void;
  projet: Projet | null;
  onSuccess: () => void;
}) {
  const [selectionnees, setSelectionnees] = useState<Set<string>>(new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [nbDesactivees, setNbDesactivees] = useState(0);
  const [erreurSauvegarde, setErreurSauvegarde] = useState('');
  const etatInitialRef = useRef<Set<string>>(new Set());

  const { data: dataActivites } = useQuery<{ arbreActivites: Activite[] }>(ARBRE_ACTIVITES, {
    skip: !ouvert,
  });

  const { data: dataProjet } = useQuery<{ projet: Projet }>(PROJET_QUERY, {
    variables: { id: projet?.id },
    skip: !ouvert || !projet?.id,
    fetchPolicy: 'network-only',
  });

  const [setProjectActivities, { loading }] = useMutation(SET_PROJECT_ACTIVITIES);

  const activites = dataActivites?.arbreActivites || [];

  useEffect(() => {
    if (dataProjet?.projet?.activitesActives) {
      const initialIds = new Set(dataProjet.projet.activitesActives.map((a) => a.id));
      setSelectionnees(initialIds);
      etatInitialRef.current = initialIds;
    }
  }, [dataProjet]);

  const collecterToutesLesFeuilles = (liste: Activite[]): string[] => {
    return liste.flatMap((a) => {
      if (a.estFeuille) return [a.id];
      if (a.enfants) return collecterToutesLesFeuilles(a.enfants);
      return [];
    });
  };

  const toutesLesFeuilles = useMemo(() => collecterToutesLesFeuilles(activites), [activites]);

  const getEtatActivite = (activite: Activite): { checked: boolean; indeterminate: boolean } => {
    if (activite.estFeuille) {
      return { checked: selectionnees.has(activite.id), indeterminate: false };
    }

    const feuillesIds = activite.enfants ? collecterToutesLesFeuilles([activite]) : [];
    const nbSelectionnees = feuillesIds.filter((id) => selectionnees.has(id)).length;

    if (nbSelectionnees === 0) {
      return { checked: false, indeterminate: false };
    }
    if (nbSelectionnees === feuillesIds.length) {
      return { checked: true, indeterminate: false };
    }
    return { checked: false, indeterminate: true };
  };

  const handleToggle = (id: string, enfantIds: string[]) => {
    setSelectionnees((prev) => {
      const next = new Set(prev);
      if (enfantIds.length === 1 && enfantIds[0] === id) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        const tousSelectionnees = enfantIds.every((eid) => next.has(eid));
        if (tousSelectionnees) {
          enfantIds.forEach((eid) => next.delete(eid));
        } else {
          enfantIds.forEach((eid) => next.add(eid));
        }
      }
      return next;
    });
  };

  const toutSelectionner = () => setSelectionnees(new Set(toutesLesFeuilles));
  const toutDeselectionner = () => setSelectionnees(new Set());

  const effectuerSauvegarde = useCallback(async () => {
    setErreurSauvegarde('');
    try {
      await setProjectActivities({
        variables: {
          projetId: projet!.id,
          activiteIds: Array.from(selectionnees),
        },
      });
      setToastVisible(false);
      onSuccess();
      onFermer();
    } catch (err) {
      setErreurSauvegarde(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
      setToastVisible(false);
    }
  }, [projet, selectionnees, setProjectActivities, onSuccess, onFermer]);

  const handleAnnulerDesactivation = useCallback(() => {
    setSelectionnees(etatInitialRef.current);
    setToastVisible(false);
  }, []);

  const handleSave = async () => {
    const desactivees = [...etatInitialRef.current].filter((id) => !selectionnees.has(id));

    if (desactivees.length > 3) {
      setNbDesactivees(desactivees.length);
      setToastVisible(true);
    } else {
      await effectuerSauvegarde();
    }
  };

  return (
    <>
      <Transition appear show={ouvert} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onFermer}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <Dialog.Title className="text-lg font-semibold">
                      Activites pour {projet?.nom}
                    </Dialog.Title>
                    <button onClick={onFermer} className="p-1 rounded hover:bg-gray-100">
                      <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {selectionnees.size} activite(s) selectionnee(s)
                    </span>
                    <div className="flex gap-2">
                      <button onClick={toutSelectionner} className="text-xs text-blue-600 hover:underline">
                        Tout selectionner
                      </button>
                      <button onClick={toutDeselectionner} className="text-xs text-gray-500 hover:underline">
                        Tout deselectionner
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {activites.map((activite) => (
                      <LigneActiviteCheckbox
                        key={activite.id}
                        activite={activite}
                        niveau={0}
                        selectionnees={selectionnees}
                        onToggle={handleToggle}
                        getEtatActivite={getEtatActivite}
                      />
                    ))}
                  </div>

                  {erreurSauvegarde && (
                    <div className="mx-4 mb-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {erreurSauvegarde}
                    </div>
                  )}
                  <div className="flex justify-end gap-3 p-4 border-t">
                    <button onClick={onFermer} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
                      Annuler
                    </button>
                    <button onClick={handleSave} disabled={loading || toastVisible} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ToastAnnulation
        visible={toastVisible}
        message={`${nbDesactivees} activite(s) desactivee(s)`}
        delaiMs={5000}
        onAnnuler={handleAnnulerDesactivation}
        onExpire={effectuerSauvegarde}
      />
    </>
  );
}
