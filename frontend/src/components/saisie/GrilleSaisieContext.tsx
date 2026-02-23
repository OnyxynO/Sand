import { createContext, useContext } from 'react';

interface GrilleSaisieContextValue {
  naviguerCellule: (ligneIndex: number, jourIndex: number) => void;
  ouvrirHistorique: (ligneId: string, dateStr: string) => void;
}

export const GrilleSaisieContext = createContext<GrilleSaisieContextValue>({
  naviguerCellule: () => {},
  ouvrirHistorique: () => {},
});

export function useGrilleSaisie() {
  return useContext(GrilleSaisieContext);
}
