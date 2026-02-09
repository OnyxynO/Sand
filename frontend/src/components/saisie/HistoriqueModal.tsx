// Modale d'historique des modifications d'une saisie

import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoriqueEntry {
  id: string;
  action: string;
  ancienneDuree: number | null;
  nouvelleDuree: number | null;
  ancienCommentaire: string | null;
  nouveauCommentaire: string | null;
  createdAt: string;
  auteur: {
    nomComplet: string;
  };
}

interface HistoriqueModalProps {
  ouvert: boolean;
  onFermer: () => void;
  historique: HistoriqueEntry[];
  activiteNom: string;
  projetCode: string;
  date: string;
}

function formatAction(entry: HistoriqueEntry): string {
  const auteur = entry.auteur.nomComplet;

  switch (entry.action) {
    case 'CREATION':
    case 'creation':
      return `${auteur} a cree la saisie (${entry.nouvelleDuree} ETP)`;

    case 'MODIFICATION':
    case 'modification':
      if (entry.ancienneDuree !== entry.nouvelleDuree) {
        return `${auteur} a modifie la duree de ${entry.ancienneDuree} a ${entry.nouvelleDuree} ETP`;
      }
      if (entry.ancienCommentaire !== entry.nouveauCommentaire) {
        return `${auteur} a modifie le commentaire`;
      }
      return `${auteur} a modifie la saisie`;

    case 'SUPPRESSION':
    case 'suppression':
      return `${auteur} a supprime la saisie (${entry.ancienneDuree} ETP)`;

    default:
      return `${auteur} a effectue une action`;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, "d MMM yyyy 'a' HH:mm", { locale: fr });
}

const actionStyles: Record<string, string> = {
  creation: 'bg-green-100 text-green-800',
  CREATION: 'bg-green-100 text-green-800',
  modification: 'bg-blue-100 text-blue-800',
  MODIFICATION: 'bg-blue-100 text-blue-800',
  suppression: 'bg-red-100 text-red-800',
  SUPPRESSION: 'bg-red-100 text-red-800',
};

const actionLabels: Record<string, string> = {
  creation: 'Creation',
  CREATION: 'Creation',
  modification: 'Modification',
  MODIFICATION: 'Modification',
  suppression: 'Suppression',
  SUPPRESSION: 'Suppression',
};

export default function HistoriqueModal({
  ouvert,
  onFermer,
  historique,
  activiteNom,
  projetCode,
  date,
}: HistoriqueModalProps) {
  if (!ouvert) return null;

  const dateFormatee = format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onFermer}
      />

      {/* Modale */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Historique</h3>
            <p className="text-sm text-gray-500">
              {projetCode} / {activiteNom} - {dateFormatee}
            </p>
          </div>
          <button
            onClick={onFermer}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {historique.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun historique pour cette saisie.</p>
          ) : (
            <div className="space-y-4">
              {historique.map((entry, index) => (
                <div key={entry.id} className="relative pl-6">
                  {/* Ligne de timeline */}
                  {index < historique.length - 1 && (
                    <div className="absolute left-2 top-6 w-0.5 h-full bg-gray-200" />
                  )}
                  {/* Point */}
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          actionStyles[entry.action] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {actionLabels[entry.action] || entry.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{formatAction(entry)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
