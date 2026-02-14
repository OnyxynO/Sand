// Composant cellule editable de la grille de saisie

import { useState, useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent, FocusEvent, MouseEvent } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useSaisieStore } from '../../stores/saisieStore';
import { formatDuree, parseDuree } from '../../utils/semaineUtils';
import type { CelluleSaisieData, JourSemaine } from '../../types';

interface CelluleSaisieProps {
  ligneId: string;
  jour: JourSemaine;
  cellule: CelluleSaisieData;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onHistorique?: () => void;
}

export default function CelluleSaisie({ ligneId, jour, cellule, onNavigate, onHistorique }: CelluleSaisieProps) {
  const { modifierCellule } = useSaisieStore();
  const [enEdition, setEnEdition] = useState(false);
  const [valeurTemp, setValeurTemp] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialiser la valeur temporaire quand on entre en edition
  useEffect(() => {
    if (enEdition) {
      setValeurTemp(formatDuree(cellule.duree));
      // Focus avec un petit delai pour laisser le DOM se mettre a jour
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [enEdition, cellule.duree]);

  // Valider et sauvegarder la valeur
  const validerValeur = useCallback(() => {
    const nouvelleDuree = parseDuree(valeurTemp);

    // Si la valeur est invalide et non vide, ne pas sauvegarder
    if (valeurTemp.trim() !== '' && nouvelleDuree === null) {
      // Valeur invalide - on restaure l'ancienne valeur
      setEnEdition(false);
      return;
    }

    // Verifier si la valeur a change
    const ancienneDuree = cellule.duree;
    if (nouvelleDuree !== ancienneDuree) {
      modifierCellule(ligneId, jour.dateStr, nouvelleDuree);
    }

    setEnEdition(false);
  }, [valeurTemp, cellule.duree, ligneId, jour.dateStr, modifierCellule]);

  // Gestion du clavier
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        validerValeur();
        // Naviguer vers le bas apres validation
        onNavigate?.('down');
        break;
      case 'Escape':
        setEnEdition(false);
        break;
      case 'Tab':
        e.preventDefault();
        validerValeur();
        // Naviguer vers la droite ou gauche selon Shift
        onNavigate?.(e.shiftKey ? 'left' : 'right');
        break;
      case 'ArrowUp':
        e.preventDefault();
        validerValeur();
        onNavigate?.('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        validerValeur();
        onNavigate?.('down');
        break;
    }
  };

  // Gestion du blur
  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    // Eviter de valider si on clique sur une autre cellule (gere par onNavigate)
    validerValeur();
  };

  // Determiner les classes de la cellule
  const estDesactive = jour.estFutur;
  const estModifiee = cellule.estModifiee;
  const aValeur = cellule.duree !== null && cellule.duree > 0;

  const cellClasses = [
    'w-16 h-10 text-center text-sm border rounded transition-colors',
    estDesactive
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'hover:bg-blue-50 cursor-pointer',
    estModifiee && !estDesactive ? 'border-blue-400 bg-blue-50' : 'border-gray-200',
    jour.estAujourdhui && !estDesactive ? 'ring-2 ring-blue-300' : '',
  ].join(' ');

  // Mode lecture seule pour les jours futurs
  if (estDesactive) {
    return (
      <td className="px-1 py-1">
        <div className={cellClasses}>
          <span className="leading-10">{formatDuree(cellule.duree) || '-'}</span>
        </div>
      </td>
    );
  }

  // Mode edition
  if (enEdition) {
    return (
      <td className="px-1 py-1">
        <input
          ref={inputRef}
          type="text"
          value={valeurTemp}
          onChange={(e) => setValeurTemp(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-16 h-10 text-center text-sm border-2 border-blue-500 rounded focus:outline-none"
          placeholder="0.00"
        />
      </td>
    );
  }

  // Clic sur l'icone historique
  const handleHistorique = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onHistorique?.();
  };

  // Mode affichage
  return (
    <td className="px-1 py-1">
      <div
        className={`${cellClasses} relative group/cell`}
        onClick={() => setEnEdition(true)}
        onDoubleClick={() => setEnEdition(true)}
        tabIndex={0}
        role="button"
        aria-label={`Saisir pour ${jour.jourComplet}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setEnEdition(true);
          }
        }}
      >
        <span className="leading-10">
          {aValeur ? formatDuree(cellule.duree) : ''}
        </span>
        {/* Icone historique sur les saisies existantes */}
        {cellule.id && onHistorique && (
          <button
            onClick={handleHistorique}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow border border-gray-200 opacity-0 group-hover/cell:opacity-100 transition-opacity hover:bg-blue-50 hover:border-blue-300 z-10"
            title="Voir l'historique"
            aria-label="Voir l'historique des modifications"
          >
            <ClockIcon className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600" />
          </button>
        )}
      </div>
    </td>
  );
}
