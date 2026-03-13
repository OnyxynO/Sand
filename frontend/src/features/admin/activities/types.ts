export interface Activite {
  id: string;
  nom: string;
  code?: string;
  description?: string;
  chemin: string;
  niveau: number;
  ordre: number;
  estFeuille: boolean;
  estSysteme: boolean;
  estActif: boolean;
  enfants?: Activite[];
}

export interface ActiviteFormData {
  id?: string;
  nom: string;
  code: string;
  description: string;
  parentId?: string;
  estActif: boolean;
}
