import { useState, useEffect, Fragment } from 'react';
import { useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CREATE_PROJECT, UPDATE_PROJECT } from '../../graphql/operations/projects';
import type { Projet } from './types';

export default function FormulaireProjet({
  ouvert,
  onFermer,
  onSuccess,
  projet,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onSuccess: () => void;
  projet: Projet | null;
}) {
  const estEdition = !!projet?.id;
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    estActif: true,
  });
  const [erreur, setErreur] = useState('');

  const [createProject, { loading: creationEnCours }] = useMutation(CREATE_PROJECT);
  const [updateProject, { loading: modificationEnCours }] = useMutation(UPDATE_PROJECT);

  useEffect(() => {
    if (ouvert && projet) {
      setFormData({
        nom: projet.nom,
        code: projet.code,
        description: projet.description || '',
        dateDebut: projet.dateDebut || '',
        dateFin: projet.dateFin || '',
        estActif: projet.estActif,
      });
    } else if (ouvert) {
      setFormData({ nom: '', code: '', description: '', dateDebut: '', dateFin: '', estActif: true });
    }
    setErreur('');
  }, [ouvert, projet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!formData.nom.trim() || !formData.code.trim()) {
      setErreur('Le nom et le code sont obligatoires');
      return;
    }

    try {
      if (estEdition) {
        await updateProject({
          variables: {
            id: projet!.id,
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim().toUpperCase(),
              description: formData.description.trim() || null,
              dateDebut: formData.dateDebut || null,
              dateFin: formData.dateFin || null,
              estActif: formData.estActif,
            },
          },
        });
      } else {
        await createProject({
          variables: {
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim().toUpperCase(),
              description: formData.description.trim() || null,
              dateDebut: formData.dateDebut || null,
              dateFin: formData.dateFin || null,
              estActif: formData.estActif,
            },
          },
        });
      }
      onSuccess();
      onFermer();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <Transition appear show={ouvert} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onFermer}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold">{estEdition ? 'Modifier' : 'Nouveau'} projet</Dialog.Title>
                  <button onClick={onFermer} className="p-1 rounded hover:bg-gray-100"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                      <input type="text" value={formData.nom} onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                      <input type="text" value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date debut</label>
                      <input type="date" value={formData.dateDebut} onChange={(e) => setFormData((p) => ({ ...p, dateDebut: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                      <input type="date" value={formData.dateFin} onChange={(e) => setFormData((p) => ({ ...p, dateFin: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  {estEdition && (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.estActif} onChange={(e) => setFormData((p) => ({ ...p, estActif: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">Projet actif</span>
                    </label>
                  )}
                  {erreur && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{erreur}</div>}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onFermer} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" disabled={creationEnCours || modificationEnCours} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {creationEnCours || modificationEnCours ? 'Enregistrement...' : estEdition ? 'Modifier' : 'Creer'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
