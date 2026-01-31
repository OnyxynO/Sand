// Formulaire de creation/modification d'utilisateur

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation } from '@apollo/client/react';
import { TEAMS_QUERY, CREATE_USER, UPDATE_USER } from '../../graphql/operations/users';
import type { UserRole } from '../../types';

interface Equipe {
  id: string;
  nom: string;
  code: string;
  estActif: boolean;
}

interface UtilisateurFormData {
  id?: string;
  matricule?: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  role: UserRole;
  equipeId?: string;
  estActif?: boolean;
}

interface FormulaireUtilisateurProps {
  ouvert: boolean;
  onFermer: () => void;
  onSuccess: () => void;
  utilisateur?: UtilisateurFormData | null;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'UTILISATEUR', label: 'Utilisateur' },
  { value: 'MODERATEUR', label: 'Moderateur' },
  { value: 'ADMIN', label: 'Administrateur' },
];

export default function FormulaireUtilisateur({
  ouvert,
  onFermer,
  onSuccess,
  utilisateur,
}: FormulaireUtilisateurProps) {
  const estEdition = !!utilisateur?.id;

  // State du formulaire
  const [formData, setFormData] = useState<UtilisateurFormData>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'UTILISATEUR',
    matricule: '',
    equipeId: '',
  });
  const [erreur, setErreur] = useState('');

  // Charger les equipes
  const { data: dataEquipes } = useQuery<{ equipes: Equipe[] }>(TEAMS_QUERY, {
    variables: { actifSeulement: true },
    skip: !ouvert,
  });

  // Mutations
  const [createUser, { loading: creationEnCours }] = useMutation(CREATE_USER);
  const [updateUser, { loading: modificationEnCours }] = useMutation(UPDATE_USER);

  const enCours = creationEnCours || modificationEnCours;

  // Initialiser le formulaire quand on ouvre en mode edition
  useEffect(() => {
    if (ouvert && utilisateur) {
      setFormData({
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        password: '',
        role: utilisateur.role,
        matricule: utilisateur.matricule || '',
        equipeId: utilisateur.equipeId || '',
        estActif: utilisateur.estActif,
      });
    } else if (ouvert) {
      // Reset pour creation
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'UTILISATEUR',
        matricule: '',
        equipeId: '',
      });
    }
    setErreur('');
  }, [ouvert, utilisateur]);

  // Gestion des changements
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    // Validation basique
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      setErreur('Les champs nom, prenom et email sont obligatoires');
      return;
    }

    if (!estEdition && !formData.password) {
      setErreur('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }

    try {
      if (estEdition) {
        await updateUser({
          variables: {
            id: formData.id,
            input: {
              nom: formData.nom.trim(),
              prenom: formData.prenom.trim(),
              email: formData.email.trim(),
              password: formData.password || undefined,
              role: formData.role,
              matricule: formData.matricule?.trim() || undefined,
              equipeId: formData.equipeId || undefined,
            },
          },
        });
      } else {
        await createUser({
          variables: {
            input: {
              nom: formData.nom.trim(),
              prenom: formData.prenom.trim(),
              email: formData.email.trim(),
              password: formData.password,
              role: formData.role,
              matricule: formData.matricule?.trim() || undefined,
              equipeId: formData.equipeId || undefined,
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                {/* En-tete */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {estEdition ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                  </Dialog.Title>
                  <button
                    onClick={onFermer}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {/* Prenom + Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prenom *
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe {!estEdition && '*'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={estEdition ? 'Laisser vide pour ne pas changer' : ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!estEdition}
                    />
                  </div>

                  {/* Matricule */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matricule
                    </label>
                    <input
                      type="text"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Equipe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipe
                    </label>
                    <select
                      name="equipeId"
                      value={formData.equipeId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Aucune equipe</option>
                      {dataEquipes?.equipes?.map((equipe) => (
                        <option key={equipe.id} value={equipe.id}>
                          {equipe.nom} ({equipe.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Erreur */}
                  {erreur && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {erreur}
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onFermer}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                      disabled={enCours}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={enCours}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
