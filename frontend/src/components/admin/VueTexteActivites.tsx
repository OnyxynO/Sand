// Vue texte de l'arborescence des activites

import { useState, useMemo, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  arbreVersTexte,
  texteVersArbre,
  validerTexte,
  calculerDiff,
} from '../../hooks/useParserArbreTexte';
import type { Changement } from '../../hooks/useParserArbreTexte';
import {
  CREATE_ACTIVITY,
  UPDATE_ACTIVITY,
  DELETE_ACTIVITY,
  MOVE_ACTIVITY,
} from '../../graphql/operations/activities';

interface Activite {
  id: string;
  nom: string;
  code?: string;
  niveau: number;
  estSysteme: boolean;
  estActif: boolean;
  enfants?: Activite[];
}

interface Props {
  activites: Activite[];
  onAppliquer: () => void;
}

type Etape = 'edition' | 'previsualisation' | 'application';

// Couleurs par type de changement
const COULEURS_CHANGEMENT: Record<string, string> = {
  creation: 'bg-green-50 text-green-800 border-green-200',
  suppression: 'bg-red-50 text-red-800 border-red-200',
  deplacement: 'bg-blue-50 text-blue-800 border-blue-200',
  modification: 'bg-yellow-50 text-yellow-800 border-yellow-200',
};

const LABELS_CHANGEMENT: Record<string, string> = {
  creation: 'Creation',
  suppression: 'Suppression',
  deplacement: 'Deplacement',
  modification: 'Modification',
};

// Trouver l'ID d'une activite par nom dans l'arbre
function trouverIdParNom(nom: string, activites: Activite[]): string | null {
  for (const a of activites) {
    if (a.nom === nom) return a.id;
    if (a.enfants) {
      const id = trouverIdParNom(nom, a.enfants);
      if (id) return id;
    }
  }
  return null;
}

// Trouver l'ID du parent d'une activite par nom dans l'arbre
function trouverParentIdParNom(nom: string, activites: Activite[], parentId: string | null = null): string | null {
  for (const a of activites) {
    if (a.nom === nom) return parentId;
    if (a.enfants) {
      const id = trouverParentIdParNom(nom, a.enfants, a.id);
      if (id !== null || a.enfants.some((e) => e.nom === nom)) {
        return id !== null ? id : a.id;
      }
    }
  }
  return null;
}

export default function VueTexteActivites({ activites, onAppliquer }: Props) {
  const texteInitial = useMemo(() => arbreVersTexte(activites), [activites]);
  const [texte, setTexte] = useState(texteInitial);
  const [etape, setEtape] = useState<Etape>('edition');
  const [changements, setChangements] = useState<Changement[]>([]);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [progression, setProgression] = useState('');

  const [createActivity] = useMutation(CREATE_ACTIVITY);
  const [updateActivity] = useMutation(UPDATE_ACTIVITY);
  const [deleteActivity] = useMutation(DELETE_ACTIVITY);
  const [moveActivity] = useMutation(MOVE_ACTIVITY);

  const estModifie = texte !== texteInitial;

  // Reinitialiser le texte quand les activites changent
  const handleReinitialiser = useCallback(() => {
    setTexte(texteInitial);
    setEtape('edition');
    setErreurs([]);
    setChangements([]);
  }, [texteInitial]);

  // Valider et passer a la previsualisation
  const handlePrevisualiser = useCallback(() => {
    const errs = validerTexte(texte, activites);
    if (errs.length > 0) {
      setErreurs(errs.map((e) => e.ligne > 0 ? `Ligne ${e.ligne} : ${e.message}` : e.message));
      return;
    }
    setErreurs([]);

    const nouvelArbre = texteVersArbre(texte);
    const diff = calculerDiff(activites, nouvelArbre);

    if (diff.length === 0) {
      setErreurs(['Aucun changement detecte']);
      return;
    }

    setChangements(diff);
    setEtape('previsualisation');
  }, [texte, activites]);

  // Appliquer les mutations sequentiellement
  const handleConfirmer = useCallback(async () => {
    setEtape('application');
    setProgression('Application des changements...');

    try {
      // 1. Suppressions
      const suppressions = changements.filter((c) => c.type === 'suppression');
      for (const s of suppressions) {
        setProgression(`Suppression de "${s.nom}"...`);
        const id = trouverIdParNom(s.nom, activites);
        if (id) {
          await deleteActivity({ variables: { id } });
        }
      }

      // 2. Creations
      const nouvelArbre = texteVersArbre(texte);
      const creations = changements.filter((c) => c.type === 'creation');
      for (const c of creations) {
        setProgression(`Creation de "${c.nom}"...`);
        // Trouver le parent dans le nouvel arbre
        const parentNom = trouverParentDansNouvelArbre(c.nom, nouvelArbre);
        let parentId: string | null = null;
        if (parentNom) {
          parentId = trouverIdParNom(parentNom, activites);
        }
        // Extraire le code du nouvel arbre
        const noeud = trouverNoeudParNom(c.nom, nouvelArbre);
        await createActivity({
          variables: {
            input: {
              nom: c.nom,
              code: noeud?.code || null,
              parentId,
              estActif: true,
            },
          },
        });
      }

      // 3. Deplacements
      const deplacements = changements.filter((c) => c.type === 'deplacement');
      for (const d of deplacements) {
        setProgression(`Deplacement de "${d.nom}"...`);
        const id = trouverIdParNom(d.nom, activites);
        // Trouver le nouveau parent dans le nouvel arbre
        const parentNom = trouverParentDansNouvelArbre(d.nom, nouvelArbre);
        let parentId: string | null = null;
        if (parentNom) {
          parentId = trouverIdParNom(parentNom, activites);
        }
        if (id) {
          await moveActivity({
            variables: { id, parentId, ordre: 0 },
          });
        }
      }

      // 4. Modifications
      const modifications = changements.filter((c) => c.type === 'modification');
      for (const m of modifications) {
        setProgression(`Modification de "${m.nom}"...`);
        const id = trouverIdParNom(m.nom, activites);
        const noeud = trouverNoeudParNom(m.nom, nouvelArbre);
        if (id && noeud) {
          await updateActivity({
            variables: {
              id,
              input: {
                code: noeud.code || null,
              },
            },
          });
        }
      }

      setProgression('Terminé !');
      onAppliquer();
      // Retour a l'edition apres succes
      setTimeout(() => {
        setEtape('edition');
        setChangements([]);
        setProgression('');
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setErreurs([`Erreur lors de l'application : ${message}`]);
      setEtape('previsualisation');
      setProgression('');
    }
  }, [changements, activites, texte, createActivity, updateActivity, deleteActivity, moveActivity, onAppliquer]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* Etape 1 : Edition */}
      {etape === 'edition' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Editez l'arborescence ci-dessous. 4 espaces = 1 niveau. Code entre parentheses.
            </p>
            {estModifie && (
              <span className="text-xs text-orange-600 font-medium">Modifie</span>
            )}
          </div>

          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            className="w-full h-96 font-mono text-sm p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            spellCheck={false}
            data-testid="textarea-arbre"
          />

          {erreurs.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 mb-1">Erreurs de validation :</p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                {erreurs.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleReinitialiser}
              disabled={!estModifie}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Reinitialiser
            </button>
            <button
              onClick={handlePrevisualiser}
              disabled={!estModifie}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Appliquer les modifications
            </button>
          </div>
        </>
      )}

      {/* Etape 2 : Previsualisation */}
      {etape === 'previsualisation' && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Previsualisation des changements
            </h3>
            <p className="text-sm text-gray-500">
              {changements.length} changement{changements.length > 1 ? 's' : ''} detecte{changements.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            {changements.map((c, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${COULEURS_CHANGEMENT[c.type]}`}
                data-testid={`changement-${c.type}`}
              >
                <span className="text-xs font-semibold uppercase whitespace-nowrap">
                  {LABELS_CHANGEMENT[c.type]}
                </span>
                <div className="text-sm">
                  <span className="font-medium">{c.nom}</span>
                  <span className="text-gray-600 ml-2">{c.details}</span>
                </div>
              </div>
            ))}
          </div>

          {erreurs.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-sm text-red-700 list-disc list-inside">
                {erreurs.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setEtape('edition'); setErreurs([]); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
            >
              Retour a l'edition
            </button>
            <button
              onClick={handleConfirmer}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Confirmer
            </button>
          </div>
        </>
      )}

      {/* Etape 3 : Application */}
      {etape === 'application' && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-600">{progression}</p>
        </div>
      )}
    </div>
  );
}

// Utilitaires pour naviguer dans le nouvel arbre parse

function trouverParentDansNouvelArbre(nom: string, noeuds: { nom: string; enfants: any[] }[]): string | null {
  for (const n of noeuds) {
    if (n.enfants.some((e: any) => e.nom === nom)) return n.nom;
    const resultat = trouverParentDansNouvelArbre(nom, n.enfants);
    if (resultat) return resultat;
  }
  return null;
}

function trouverNoeudParNom(nom: string, noeuds: { nom: string; code?: string; enfants: any[] }[]): { nom: string; code?: string } | null {
  for (const n of noeuds) {
    if (n.nom === nom) return n;
    const resultat = trouverNoeudParNom(nom, n.enfants);
    if (resultat) return resultat;
  }
  return null;
}
