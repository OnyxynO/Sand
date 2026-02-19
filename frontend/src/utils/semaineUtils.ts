// Utilitaires pour la gestion des semaines ISO

import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  getISOWeek,
  getISOWeekYear,
  eachDayOfInterval,
  isAfter,
  startOfDay,
  isSameDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Format semaine ISO : "2025-W04"
export type SemaineISO = string;

// Jour de la semaine avec sa date
export interface JourSemaine {
  date: Date;
  dateStr: string; // Format YYYY-MM-DD
  jourNom: string; // Lun, Mar, etc.
  jourComplet: string; // Lundi, Mardi, etc.
  estAujourdhui: boolean;
  estFutur: boolean;
}

/**
 * Obtient la semaine ISO courante
 */
export function getSemaineActuelle(): SemaineISO {
  const aujourdhui = new Date();
  const annee = getISOWeekYear(aujourdhui);
  const semaine = getISOWeek(aujourdhui);
  return `${annee}-W${semaine.toString().padStart(2, '0')}`;
}

/**
 * Parse une semaine ISO et retourne le lundi de cette semaine
 */
export function parseSemaineISO(semaineISO: SemaineISO): Date {
  // Format: "2025-W04"
  const match = semaineISO.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Format semaine invalide: ${semaineISO}`);
  }

  const annee = parseInt(match[1], 10);
  const semaine = parseInt(match[2], 10);

  // Trouver le premier jeudi de l'annee (determine la semaine 1 ISO)
  const janvierQuatre = new Date(annee, 0, 4);
  const premierJeudi = startOfWeek(janvierQuatre, { weekStartsOn: 1 });

  // Ajouter le nombre de semaines necessaires
  return addWeeks(premierJeudi, semaine - 1);
}

/**
 * Convertit une date en semaine ISO
 */
export function dateVersSemaineISO(date: Date): SemaineISO {
  const annee = getISOWeekYear(date);
  const semaine = getISOWeek(date);
  return `${annee}-W${semaine.toString().padStart(2, '0')}`;
}

/**
 * Obtient la semaine precedente
 */
export function getSemainePrecedente(semaineISO: SemaineISO): SemaineISO {
  const lundi = parseSemaineISO(semaineISO);
  const lundiPrecedent = subWeeks(lundi, 1);
  return dateVersSemaineISO(lundiPrecedent);
}

/**
 * Obtient la semaine suivante
 */
export function getSemaineSuivante(semaineISO: SemaineISO): SemaineISO {
  const lundi = parseSemaineISO(semaineISO);
  const lundiSuivant = addWeeks(lundi, 1);
  return dateVersSemaineISO(lundiSuivant);
}

/**
 * Obtient les 7 jours d'une semaine avec leurs informations
 */
export function getJoursSemaine(semaineISO: SemaineISO): JourSemaine[] {
  const lundi = parseSemaineISO(semaineISO);
  const dimanche = endOfWeek(lundi, { weekStartsOn: 1 });
  const aujourdhui = startOfDay(new Date());

  const jours = eachDayOfInterval({ start: lundi, end: dimanche });

  return jours.map((date) => ({
    date,
    dateStr: format(date, 'yyyy-MM-dd'),
    jourNom: format(date, 'EEE', { locale: fr }), // Lun, Mar, etc.
    jourComplet: format(date, 'EEEE', { locale: fr }), // Lundi, etc.
    estAujourdhui: isSameDay(date, aujourdhui),
    estFutur: isAfter(startOfDay(date), aujourdhui),
  }));
}

/**
 * Formate une semaine ISO pour affichage utilisateur
 * Ex: "Semaine 4 - 20 au 26 janvier 2025"
 */
export function formatSemainePourAffichage(semaineISO: SemaineISO): string {
  const lundi = parseSemaineISO(semaineISO);
  const dimanche = endOfWeek(lundi, { weekStartsOn: 1 });
  const semaine = getISOWeek(lundi);

  const debutStr = format(lundi, 'd', { locale: fr });
  const finStr = format(dimanche, 'd MMMM yyyy', { locale: fr });

  // Si meme mois
  if (lundi.getMonth() === dimanche.getMonth()) {
    return `Semaine ${semaine} - ${debutStr} au ${finStr}`;
  }

  // Si mois differents
  const debutComplet = format(lundi, 'd MMMM', { locale: fr });
  return `Semaine ${semaine} - ${debutComplet} au ${finStr}`;
}

/**
 * Formate un jour pour l'en-tete de colonne
 * Ex: "Lun 20"
 */
export function formatJourEnTete(jour: JourSemaine): string {
  const jourNomCapitalize = jour.jourNom.charAt(0).toUpperCase() + jour.jourNom.slice(1);
  const jourNum = format(jour.date, 'd');
  return `${jourNomCapitalize} ${jourNum}`;
}

/**
 * Verifie si une semaine est la semaine courante
 */
export function estSemaineCourante(semaineISO: SemaineISO): boolean {
  return semaineISO === getSemaineActuelle();
}

/**
 * Calcule le total d'heures pour une liste de durees
 */
export function calculerTotal(durees: (number | null | undefined)[]): number {
  return durees.reduce((acc: number, d) => acc + (d || 0), 0);
}

/**
 * Formate une duree ETP pour affichage (max 2 decimales)
 */
export function formatDuree(duree: number | null | undefined): string {
  if (duree === null || duree === undefined || duree === 0) {
    return '';
  }
  // Arrondir a 2 decimales et supprimer les zeros inutiles
  return parseFloat(duree.toFixed(2)).toString();
}

/**
 * Parse une saisie utilisateur en duree ETP valide
 * Retourne null si invalide
 */
export function parseDuree(valeur: string): number | null {
  if (!valeur || valeur.trim() === '') {
    return null;
  }

  // Remplacer virgule par point
  const normalise = valeur.replace(',', '.').trim();
  const nombre = parseFloat(normalise);

  if (isNaN(nombre) || nombre < 0.01 || nombre > 1) {
    return null;
  }

  // Arrondir a 2 decimales
  return Math.round(nombre * 100) / 100;
}
