// Toast d'annulation avec barre de progression
// Permet d'annuler une action pendant un delai configurable

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ToastAnnulationProps {
  visible: boolean;
  message: string;
  delaiMs?: number;  // Delai avant execution (defaut: 5000ms)
  onAnnuler: () => void;
  onExpire: () => void;  // Appele quand le delai expire sans annulation
  onFermer?: () => void;
}

export default function ToastAnnulation({
  visible,
  message,
  delaiMs = 5000,
  onAnnuler,
  onExpire,
  onFermer,
}: ToastAnnulationProps) {
  const [progression, setProgression] = useState(100);
  const [tempsRestant, setTempsRestant] = useState(delaiMs);

  // Reset quand le toast devient visible
  useEffect(() => {
    if (visible) {
      setProgression(100);
      setTempsRestant(delaiMs);
    }
  }, [visible, delaiMs]);

  // Decompte et barre de progression
  useEffect(() => {
    if (!visible) return;

    const intervalId = setInterval(() => {
      setTempsRestant((prev) => {
        const nouveau = prev - 100;
        if (nouveau <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        return nouveau;
      });
      setProgression((prev) => {
        const nouveau = prev - (100 / (delaiMs / 100));
        return Math.max(0, nouveau);
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [visible, delaiMs]);

  // Declencher onExpire quand le temps est ecoule
  useEffect(() => {
    if (visible && tempsRestant === 0) {
      onExpire();
    }
  }, [tempsRestant, visible, onExpire]);

  const handleAnnuler = useCallback(() => {
    onAnnuler();
  }, [onAnnuler]);

  const handleFermer = useCallback(() => {
    if (onFermer) {
      onFermer();
    }
  }, [onFermer]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden min-w-80">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm">{message}</span>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleAnnuler}
              className="px-3 py-1 text-sm font-medium bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Annuler
            </button>
            {onFermer && (
              <button
                onClick={handleFermer}
                className="p-1 hover:bg-gray-700 rounded transition-colors focus-visible:ring-2 focus-visible:ring-gray-400"
                aria-label="Fermer"
              >
                <XMarkIcon className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {/* Barre de progression */}
        <div className="h-1 bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${progression}%` }}
          />
        </div>
      </div>
    </div>
  );
}
