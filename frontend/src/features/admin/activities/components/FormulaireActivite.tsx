import { useState, useEffect, Fragment } from 'react';
import { useMutation } from '@apollo/client/react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  CREATE_ACTIVITY,
  UPDATE_ACTIVITY,
} from '../../../../graphql/operations/activities';
import type { Activite, ActiviteFormData } from '../types';

export function FormulaireActivite({
  ouvert,
  onFermer,
  onSuccess,
  activite,
  parentId,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onSuccess: () => void;
  activite: Activite | null;
  parentId: string | null;
}) {
  const estEdition = !!activite?.id;

  const [formData, setFormData] = useState<ActiviteFormData>({
    nom: '',
    code: '',
    description: '',
    estActif: true,
  });
  const [erreur, setErreur] = useState('');

  const [createActivity, { loading: creationEnCours }] = useMutation(CREATE_ACTIVITY);
  const [updateActivity, { loading: modificationEnCours }] = useMutation(UPDATE_ACTIVITY);

  const enCours = creationEnCours || modificationEnCours;

  useEffect(() => {
    if (ouvert && activite) {
      setFormData({
        id: activite.id,
        nom: activite.nom,
        code: activite.code || '',
        description: activite.description || '',
        estActif: activite.estActif,
      });
    } else if (ouvert) {
      setFormData({
        nom: '',
        code: '',
        description: '',
        parentId: parentId || undefined,
        estActif: true,
      });
    }
    setErreur('');
  }, [ouvert, activite, parentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!formData.nom.trim()) {
      setErreur('Le nom est obligatoire');
      return;
    }

    try {
      if (estEdition) {
        await updateActivity({
          variables: {
            id: formData.id,
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim() || null,
              description: formData.description.trim() || null,
              estActif: formData.estActif,
            },
          },
        });
      } else {
        await createActivity({
          variables: {
            input: {
              nom: formData.nom.trim(),
              code: formData.code.trim() || null,
              description: formData.description.trim() || null,
              parentId: parentId || null,
              estActif: formData.estActif,
            },
          },
        });
      }
      onSuccess();
      onFermer();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setErreur(message);
    }
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
          <div className="fixed inset-0 bg-[color:var(--sand-ink)]/35" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/95 shadow-[0_32px_70px_-40px_rgba(52,78,65,0.8)] backdrop-blur transition-all">
                <div className="flex items-center justify-between border-b border-[color:var(--sand-line)] px-4 py-4">
                  <Dialog.Title className="font-['Fraunces',serif] text-2xl text-[color:var(--sand-ink)]">
                    {estEdition ? 'Modifier l\'activite' : 'Nouvelle activite'}
                  </Dialog.Title>
                  <button onClick={onFermer} className="rounded-full p-1.5 transition hover:bg-[color:var(--sand-surface-strong)]">
                    <XMarkIcon className="w-5 h-5 text-[color:var(--sand-muted)]" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 text-[color:var(--sand-ink)] outline-none transition focus:ring-2 focus:ring-[color:var(--sand-accent)]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]">Code</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Ex: DEV, REUNION"
                      className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 text-[color:var(--sand-ink)] outline-none transition focus:ring-2 focus:ring-[color:var(--sand-accent)]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[color:var(--sand-muted)]">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-2xl border border-[color:var(--sand-line)] bg-white/90 px-3 py-2 text-[color:var(--sand-ink)] outline-none transition focus:ring-2 focus:ring-[color:var(--sand-accent)]/20"
                    />
                  </div>

                  {estEdition && (
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="estActif"
                          checked={formData.estActif}
                          onChange={handleChange}
                          className="rounded border-[color:var(--sand-line)] text-[color:var(--sand-accent)] focus:ring-[color:var(--sand-accent)]/20"
                        />
                        <span className="text-sm text-[color:var(--sand-ink)]">Activite active</span>
                      </label>
                    </div>
                  )}

                  {erreur && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {erreur}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 border-t border-[color:var(--sand-line)] pt-4">
                    <button
                      type="button"
                      onClick={onFermer}
                      className="rounded-full border border-[color:var(--sand-line)] bg-white/90 px-4 py-2 text-sm font-medium text-[color:var(--sand-ink)] transition hover:bg-[color:var(--sand-surface-strong)]"
                      disabled={enCours}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={enCours}
                      className="rounded-full bg-[color:var(--sand-ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--sand-accent-strong)] disabled:opacity-50"
                    >
                      {enCours ? 'Enregistrement...' : estEdition ? 'Modifier' : 'Creer'}
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
