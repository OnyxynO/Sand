// Selecteur d'utilisateur pour la moderation des saisies

import { useQuery } from '@apollo/client/react';
import { UTILISATEURS_MODERABLES } from '../../graphql/operations/saisie';
import type { UtilisateurModerable } from '../../types';

interface SelecteurUtilisateurProps {
  utilisateurId: string | null;
  onChange: (userId: string | null) => void;
}

export default function SelecteurUtilisateur({ utilisateurId, onChange }: SelecteurUtilisateurProps) {
  const { data, loading } = useQuery<{ utilisateursModerables: UtilisateurModerable[] }>(
    UTILISATEURS_MODERABLES
  );

  const utilisateurs = data?.utilisateursModerables ?? [];

  // Pas d'utilisateurs moderables = pas de selecteur
  if (!loading && utilisateurs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
      <label htmlFor="selecteur-utilisateur" className="text-sm font-medium text-blue-800 whitespace-nowrap">
        Saisir pour :
      </label>
      <select
        id="selecteur-utilisateur"
        value={utilisateurId ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
        className="rounded-md border-blue-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">Moi-meme</option>
        {utilisateurs.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nomComplet}
          </option>
        ))}
      </select>
      {utilisateurId && (
        <span className="text-sm font-medium text-blue-700">
          Mode moderation
        </span>
      )}
    </div>
  );
}
