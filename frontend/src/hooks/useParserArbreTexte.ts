// Parser pour la vue texte de l'arborescence des activites

export interface NoeudArbre {
  nom: string;
  code?: string;
  niveau: number;
  estSysteme?: boolean;
  enfants: NoeudArbre[];
}

export interface ErreurValidation {
  ligne: number;
  message: string;
}

export type TypeChangement = 'creation' | 'suppression' | 'deplacement' | 'modification';

export interface Changement {
  type: TypeChangement;
  nom: string;
  details: string;
}

interface ActiviteArbre {
  id: string;
  nom: string;
  code?: string;
  niveau: number;
  estSysteme: boolean;
  enfants?: ActiviteArbre[];
}

// Convertit l'arbre d'activites en texte indente
export function arbreVersTexte(activites: ActiviteArbre[]): string {
  const lignes: string[] = [];

  function parcourir(liste: ActiviteArbre[], niveau: number) {
    for (const a of liste) {
      const indent = '    '.repeat(niveau);
      let ligne = a.nom;
      if (a.estSysteme) {
        ligne += ' (systeme)';
      } else if (a.code) {
        ligne += ` (${a.code})`;
      }
      lignes.push(indent + ligne);
      if (a.enfants && a.enfants.length > 0) {
        parcourir(a.enfants, niveau + 1);
      }
    }
  }

  parcourir(activites, 0);
  return lignes.join('\n');
}

// Parse une ligne de texte pour extraire nom et code
function parserLigne(ligne: string): { nom: string; code?: string; estSysteme: boolean } {
  const trimmed = ligne.trim();
  if (!trimmed) return { nom: '', estSysteme: false };

  // Detecter le marqueur systeme
  const matchSysteme = trimmed.match(/^(.+?)\s+\(systeme\)$/);
  if (matchSysteme) {
    return { nom: matchSysteme[1].trim(), estSysteme: true };
  }

  // Detecter le code entre parentheses
  const matchCode = trimmed.match(/^(.+?)\s+\(([^)]+)\)$/);
  if (matchCode) {
    return { nom: matchCode[1].trim(), code: matchCode[2].trim(), estSysteme: false };
  }

  return { nom: trimmed, estSysteme: false };
}

// Calcule le niveau d'indentation (4 espaces ou 1 tab = 1 niveau)
function calculerNiveau(ligne: string): number {
  // Remplacer les tabs par 4 espaces
  const avecEspaces = ligne.replace(/\t/g, '    ');
  const match = avecEspaces.match(/^( *)/);
  if (!match) return 0;
  return Math.floor(match[1].length / 4);
}

// Parse le texte en structure arborescente
export function texteVersArbre(texte: string): NoeudArbre[] {
  const lignes = texte.split('\n');
  const racine: NoeudArbre[] = [];
  const pile: { noeud: NoeudArbre; niveau: number }[] = [];

  for (const ligne of lignes) {
    if (!ligne.trim()) continue;

    const niveau = calculerNiveau(ligne);
    const { nom, code, estSysteme } = parserLigne(ligne);
    if (!nom) continue;

    const noeud: NoeudArbre = { nom, niveau, estSysteme, enfants: [] };
    if (code) noeud.code = code;

    // Trouver le parent dans la pile
    while (pile.length > 0 && pile[pile.length - 1].niveau >= niveau) {
      pile.pop();
    }

    if (pile.length === 0) {
      racine.push(noeud);
    } else {
      pile[pile.length - 1].noeud.enfants.push(noeud);
    }

    pile.push({ noeud, niveau });
  }

  return racine;
}

// Collecte les activites systeme dans l'arbre existant
function collecterSystemes(activites: ActiviteArbre[]): Map<string, { niveau: number; cheminNoms: string }> {
  const systemes = new Map<string, { niveau: number; cheminNoms: string }>();

  function parcourir(liste: ActiviteArbre[], cheminParent: string) {
    for (const a of liste) {
      const chemin = cheminParent ? `${cheminParent}.${a.nom}` : a.nom;
      if (a.estSysteme) {
        systemes.set(a.nom, { niveau: a.niveau, cheminNoms: chemin });
      }
      if (a.enfants) parcourir(a.enfants, chemin);
    }
  }

  parcourir(activites, '');
  return systemes;
}

// Valide le texte et retourne les erreurs
export function validerTexte(texte: string, arbreExistant: ActiviteArbre[]): ErreurValidation[] {
  const erreurs: ErreurValidation[] = [];
  const lignes = texte.split('\n');
  const systemesExistants = collecterSystemes(arbreExistant);

  // Suivre les noms systeme trouves dans le texte
  const systemesVus = new Set<string>();

  let niveauPrecedent = -1;

  // Structure pour detecter les doublons parmi les freres
  // Pile des niveaux avec les noms a chaque niveau
  const nomsParNiveau: Map<number, Set<string>> = new Map();
  const pileParents: number[] = []; // pile des niveaux parents

  let numeroLigne = 0;

  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];
    if (!ligne.trim()) continue;
    numeroLigne++;

    const niveau = calculerNiveau(ligne);
    const { nom, code, estSysteme } = parserLigne(ligne);

    // Nom vide
    if (!nom) {
      erreurs.push({ ligne: i + 1, message: 'Nom vide' });
      continue;
    }

    // Nom trop long
    if (nom.length > 255) {
      erreurs.push({ ligne: i + 1, message: `Nom trop long (${nom.length}/255 caracteres)` });
    }

    // Code trop long
    if (code && code.length > 50) {
      erreurs.push({ ligne: i + 1, message: `Code trop long (${code.length}/50 caracteres)` });
    }

    // Caracteres interdits pour ltree
    if (nom.includes('.') || nom.includes('|')) {
      erreurs.push({ ligne: i + 1, message: 'Caracteres interdits : "." et "|" ne sont pas autorises' });
    }

    // Saut de niveau > 1
    if (niveau > niveauPrecedent + 1) {
      erreurs.push({ ligne: i + 1, message: `Saut de niveau invalide (niveau ${niveau} apres niveau ${niveauPrecedent})` });
    }

    // Activite systeme modifiee
    if (estSysteme) {
      systemesVus.add(nom);
      const existant = systemesExistants.get(nom);
      if (existant && existant.niveau !== niveau) {
        erreurs.push({ ligne: i + 1, message: `Activite systeme "${nom}" ne peut pas etre deplacee` });
      }
    }

    // Doublons parmi les freres
    // Quand on remonte ou reste au meme niveau, nettoyer les niveaux enfants
    if (niveau <= niveauPrecedent) {
      // Supprimer les ensembles de noms pour les niveaux strictement superieurs
      for (const [n] of nomsParNiveau) {
        if (n > niveau) nomsParNiveau.delete(n);
      }
    }

    // Si on descend d'un niveau, creer un nouveau groupe de freres
    if (niveau > niveauPrecedent || !nomsParNiveau.has(niveau)) {
      nomsParNiveau.set(niveau, new Set());
    }

    // Verifier doublon au meme niveau sous le meme parent
    const nomsAuNiveau = nomsParNiveau.get(niveau)!;
    if (nomsAuNiveau.has(nom)) {
      erreurs.push({ ligne: i + 1, message: `Nom en doublon parmi les freres : "${nom}"` });
    } else {
      nomsAuNiveau.add(nom);
    }

    niveauPrecedent = niveau;
  }

  // Verifier les activites systeme supprimees
  for (const [nom] of systemesExistants) {
    if (!systemesVus.has(nom)) {
      erreurs.push({ ligne: 0, message: `Activite systeme "${nom}" ne peut pas etre supprimee` });
    }
  }

  return erreurs;
}

// Aplatit un arbre en liste avec chemin de noms pour la comparaison
interface NoeudPlat {
  nom: string;
  code?: string;
  niveau: number;
  cheminNoms: string; // chemin de noms pour identifier l'activite
  estSysteme?: boolean;
}

function aplatirNoeuds(noeuds: NoeudArbre[], cheminParent: string = ''): NoeudPlat[] {
  const resultat: NoeudPlat[] = [];
  for (const n of noeuds) {
    const chemin = cheminParent ? `${cheminParent} > ${n.nom}` : n.nom;
    resultat.push({ nom: n.nom, code: n.code, niveau: n.niveau, cheminNoms: chemin, estSysteme: n.estSysteme });
    if (n.enfants.length > 0) {
      resultat.push(...aplatirNoeuds(n.enfants, chemin));
    }
  }
  return resultat;
}

function aplatirActivites(activites: ActiviteArbre[], cheminParent: string = ''): NoeudPlat[] {
  const resultat: NoeudPlat[] = [];
  for (const a of activites) {
    const chemin = cheminParent ? `${cheminParent} > ${a.nom}` : a.nom;
    resultat.push({ nom: a.nom, code: a.code, niveau: a.niveau, cheminNoms: chemin, estSysteme: a.estSysteme });
    if (a.enfants && a.enfants.length > 0) {
      resultat.push(...aplatirActivites(a.enfants, chemin));
    }
  }
  return resultat;
}

// Compare l'arbre existant avec le nouvel arbre et produit les changements
export function calculerDiff(arbreExistant: ActiviteArbre[], nouvelArbre: NoeudArbre[]): Changement[] {
  const changements: Changement[] = [];

  const anciensPlats = aplatirActivites(arbreExistant);
  const nouveauxPlats = aplatirNoeuds(nouvelArbre);

  const anciensParChemin = new Map(anciensPlats.map((n) => [n.cheminNoms, n]));
  const nouveauxParChemin = new Map(nouveauxPlats.map((n) => [n.cheminNoms, n]));

  // Noms existants (pour detecter les deplacements)
  const anciensParNom = new Map<string, NoeudPlat[]>();
  for (const n of anciensPlats) {
    if (!anciensParNom.has(n.nom)) anciensParNom.set(n.nom, []);
    anciensParNom.get(n.nom)!.push(n);
  }

  const nouveauxParNom = new Map<string, NoeudPlat[]>();
  for (const n of nouveauxPlats) {
    if (!nouveauxParNom.has(n.nom)) nouveauxParNom.set(n.nom, []);
    nouveauxParNom.get(n.nom)!.push(n);
  }

  // Suppressions : dans l'ancien mais pas dans le nouveau
  for (const [chemin, ancien] of anciensParChemin) {
    if (!nouveauxParChemin.has(chemin)) {
      // Verifier si c'est un deplacement (nom existe encore quelque part)
      const memeNomDansNouveau = nouveauxParNom.get(ancien.nom);
      if (memeNomDansNouveau && memeNomDansNouveau.length > 0) {
        // C'est un deplacement, pas une suppression
        const nouveauChemin = memeNomDansNouveau[0].cheminNoms;
        changements.push({
          type: 'deplacement',
          nom: ancien.nom,
          details: `${chemin} → ${nouveauChemin}`,
        });
      } else {
        changements.push({
          type: 'suppression',
          nom: ancien.nom,
          details: chemin,
        });
      }
    }
  }

  // Creations : dans le nouveau mais pas dans l'ancien
  for (const [chemin, nouveau] of nouveauxParChemin) {
    if (!anciensParChemin.has(chemin)) {
      // Verifier que ce n'est pas un deplacement deja detecte
      const memeNomDansAncien = anciensParNom.get(nouveau.nom);
      if (!memeNomDansAncien || memeNomDansAncien.length === 0) {
        changements.push({
          type: 'creation',
          nom: nouveau.nom,
          details: chemin,
        });
      }
    }
  }

  // Modifications : meme chemin mais code different
  for (const [chemin, ancien] of anciensParChemin) {
    const nouveau = nouveauxParChemin.get(chemin);
    if (nouveau && (ancien.code || '') !== (nouveau.code || '')) {
      changements.push({
        type: 'modification',
        nom: ancien.nom,
        details: `Code : "${ancien.code || ''}" → "${nouveau.code || ''}"`,
      });
    }
  }

  return changements;
}
