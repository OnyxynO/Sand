// Page de gestion des utilisateurs (Admin)

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { USERS_QUERY, TEAMS_QUERY, DELETE_USER } from '../../graphql/operations/users';
import FormulaireUtilisateur from '../../components/admin/FormulaireUtilisateur';
import NavAdmin from '../../components/admin/NavAdmin';
import type { UserRole } from '../../types';

interface Utilisateur {
  id: string;
  matricule?: string;
  nom: string;
  prenom: string;
  email: string;
  nomComplet: string;
  role: UserRole;
  estActif: boolean;
  equipe?: {
    id: string;
    nom: string;
    code: string;
  };
  createdAt: string;
}

interface Equipe {
  id: string;
  nom: string;
  code: string;
}

const ROLES_LABELS: Record<UserRole, string> = {
  UTILISATEUR: 'Utilisateur',
  MODERATEUR: 'Moderateur',
  ADMIN: 'Admin',
};

const ROLES_COLORS: Record<UserRole, string> = {
  UTILISATEUR: 'bg-gray-100 text-gray-700',
  MODERATEUR: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

export default function UtilisateursPage() {
  // Filtres
  const [recherche, setRecherche] = useState('');
  const [filtreEquipe, setFiltreEquipe] = useState('');
  const [filtreRole, setFiltreRole] = useState<UserRole | ''>('');
  const [filtreActif, setFiltreActif] = useState(true);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  // Modal
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [utilisateurEdite, setUtilisateurEdite] = useState<Utilisateur | null>(null);

  // Confirmation suppression
  const [confirmationSuppression, setConfirmationSuppression] = useState<Utilisateur | null>(null);

  // Queries
  const { data, loading, refetch } = useQuery<{
    users: { data: Utilisateur[]; paginatorInfo: { total: number } };
  }>(USERS_QUERY, {
    variables: {
      search: recherche || undefined,
      equipeId: filtreEquipe || undefined,
      role: filtreRole || undefined,
      actifSeulement: filtreActif || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: dataEquipes } = useQuery<{ equipes: Equipe[] }>(TEAMS_QUERY, {
    variables: { actifSeulement: true },
  });

  // Mutation suppression
  const [deleteUser, { loading: suppressionEnCours }] = useMutation(DELETE_USER);

  const utilisateurs = data?.users?.data || [];
  const total = data?.users?.paginatorInfo?.total || 0;

  // Ouvrir le formulaire pour creation
  const ouvrirCreation = () => {
    setUtilisateurEdite(null);
    setModaleOuverte(true);
  };

  // Ouvrir le formulaire pour edition
  const ouvrirEdition = (user: Utilisateur) => {
    setUtilisateurEdite(user);
    setModaleOuverte(true);
  };

  // Confirmer suppression
  const confirmerSuppression = async () => {
    if (!confirmationSuppression) return;

    try {
      await deleteUser({ variables: { id: confirmationSuppression.id } });
      setConfirmationSuppression(null);
      refetch();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  return (
    <div className="space-y-4">
      <NavAdmin />

      {/* En-tete */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500">{total} utilisateur{total > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={ouvrirCreation}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par nom..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setFiltresOuverts(!filtresOuverts)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg ${
              filtresOuverts ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {/* Filtres depliables */}
        {filtresOuverts && (
          <div className="flex items-center gap-4 pt-4 border-t">
            {/* Equipe */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Equipe</label>
              <select
                value={filtreEquipe}
                onChange={(e) => setFiltreEquipe(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les equipes</option>
                {dataEquipes?.equipes?.map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
              <select
                value={filtreRole}
                onChange={(e) => setFiltreRole(e.target.value as UserRole | '')}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les roles</option>
                <option value="UTILISATEUR">Utilisateur</option>
                <option value="MODERATEUR">Moderateur</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Actif */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
              <label className="flex items-center gap-2 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={filtreActif}
                  onChange={(e) => setFiltreActif(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Actifs uniquement
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && utilisateurs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Chargement...
          </div>
        ) : utilisateurs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun utilisateur trouve</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Equipe
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {utilisateurs.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${!user.estActif ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.nomComplet}</p>
                      {user.matricule && (
                        <p className="text-xs text-gray-500">#{user.matricule}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.equipe ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100">
                        {user.equipe.code}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                        ROLES_COLORS[user.role]
                      }`}
                    >
                      {ROLES_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => ouvrirEdition(user)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                        title="Modifier"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmationSuppression(user)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal formulaire */}
      <FormulaireUtilisateur
        ouvert={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        onSuccess={() => refetch()}
        utilisateur={
          utilisateurEdite
            ? {
                id: utilisateurEdite.id,
                nom: utilisateurEdite.nom,
                prenom: utilisateurEdite.prenom,
                email: utilisateurEdite.email,
                role: utilisateurEdite.role,
                matricule: utilisateurEdite.matricule,
                equipeId: utilisateurEdite.equipe?.id,
                estActif: utilisateurEdite.estActif,
              }
            : null
        }
      />

      {/* Modal confirmation suppression */}
      {confirmationSuppression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Voulez-vous vraiment supprimer l'utilisateur{' '}
              <strong>{confirmationSuppression.nomComplet}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmationSuppression(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                disabled={suppressionEnCours}
              >
                Annuler
              </button>
              <button
                onClick={confirmerSuppression}
                disabled={suppressionEnCours}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {suppressionEnCours ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
