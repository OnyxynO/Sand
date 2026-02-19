import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSemaineActuelle,
  parseSemaineISO,
  dateVersSemaineISO,
  getSemainePrecedente,
  getSemaineSuivante,
  getJoursSemaine,
  formatSemainePourAffichage,
  formatJourEnTete,
  estSemaineCourante,
  calculerTotal,
  formatDuree,
  parseDuree,
} from './semaineUtils';

describe('getSemaineActuelle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('retourne la semaine ISO courante', () => {
    // Lundi 2 fevrier 2026 = semaine 6
    vi.setSystemTime(new Date(2026, 1, 2));
    expect(getSemaineActuelle()).toBe('2026-W06');
  });

  it('retourne la bonne semaine en debut annee', () => {
    vi.setSystemTime(new Date(2026, 0, 5)); // 5 janvier 2026 = W02
    expect(getSemaineActuelle()).toBe('2026-W02');
  });
});

describe('parseSemaineISO', () => {
  it('retourne le lundi de la semaine', () => {
    const lundi = parseSemaineISO('2026-W06');
    expect(lundi.getDay()).toBe(1); // Lundi
    expect(lundi.getFullYear()).toBe(2026);
  });

  it('lance une erreur pour un format invalide', () => {
    expect(() => parseSemaineISO('invalid')).toThrow('Format semaine invalide');
  });
});

describe('dateVersSemaineISO', () => {
  it('convertit une date en semaine ISO', () => {
    const date = new Date(2026, 1, 2); // 2 fevrier 2026
    expect(dateVersSemaineISO(date)).toBe('2026-W06');
  });
});

describe('getSemainePrecedente', () => {
  it('retourne la semaine precedente', () => {
    expect(getSemainePrecedente('2026-W06')).toBe('2026-W05');
  });

  it('gere le passage annee precedente', () => {
    expect(getSemainePrecedente('2026-W01')).toBe('2025-W52');
  });
});

describe('getSemaineSuivante', () => {
  it('retourne la semaine suivante', () => {
    expect(getSemaineSuivante('2026-W06')).toBe('2026-W07');
  });

  it('gere le passage annee suivante', () => {
    expect(getSemaineSuivante('2026-W52')).toBe('2026-W53');
  });
});

describe('getJoursSemaine', () => {
  it('retourne 7 jours', () => {
    const jours = getJoursSemaine('2026-W06');
    expect(jours).toHaveLength(7);
  });

  it('commence par un lundi', () => {
    const jours = getJoursSemaine('2026-W06');
    expect(jours[0].date.getDay()).toBe(1);
  });

  it('chaque jour a les proprietes attendues', () => {
    const jours = getJoursSemaine('2026-W06');
    for (const jour of jours) {
      expect(jour.date).toBeInstanceOf(Date);
      expect(jour.dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof jour.jourNom).toBe('string');
      expect(typeof jour.jourComplet).toBe('string');
      expect(typeof jour.estAujourdhui).toBe('boolean');
      expect(typeof jour.estFutur).toBe('boolean');
    }
  });
});

describe('formatSemainePourAffichage', () => {
  it('formate correctement une semaine dans le meme mois', () => {
    const resultat = formatSemainePourAffichage('2026-W06');
    expect(resultat).toContain('Semaine 6');
    expect(resultat).toContain('au');
  });
});

describe('formatJourEnTete', () => {
  it('formate avec majuscule et numero du jour', () => {
    const jours = getJoursSemaine('2026-W06');
    const entete = formatJourEnTete(jours[0]);
    // Lun. 2 ou Lun 2 selon la locale
    expect(entete).toMatch(/^[A-Z]/);
  });
});

describe('estSemaineCourante', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('retourne true pour la semaine courante', () => {
    vi.setSystemTime(new Date(2026, 1, 2));
    expect(estSemaineCourante('2026-W06')).toBe(true);
  });

  it('retourne false pour une autre semaine', () => {
    vi.setSystemTime(new Date(2026, 1, 2));
    expect(estSemaineCourante('2026-W05')).toBe(false);
  });
});

describe('calculerTotal', () => {
  it('additionne les durees en ignorant null et undefined', () => {
    expect(calculerTotal([0.5, 0.25, null, undefined])).toBe(0.75);
  });

  it('retourne 0 pour un tableau vide', () => {
    expect(calculerTotal([])).toBe(0);
  });
});

describe('formatDuree', () => {
  it('formate une duree normale', () => {
    expect(formatDuree(0.5)).toBe('0.5');
  });

  it('retourne vide pour null', () => {
    expect(formatDuree(null)).toBe('');
  });

  it('retourne vide pour 0', () => {
    expect(formatDuree(0)).toBe('');
  });

  it('supprime les zeros inutiles', () => {
    expect(formatDuree(0.50)).toBe('0.5');
    expect(formatDuree(1.00)).toBe('1');
  });
});

describe('parseDuree', () => {
  it('parse une duree avec point', () => {
    expect(parseDuree('0.5')).toBe(0.5);
  });

  it('parse une duree avec virgule', () => {
    expect(parseDuree('0,75')).toBe(0.75);
  });

  it('retourne null si superieur a 1', () => {
    expect(parseDuree('1.5')).toBeNull();
  });

  it('retourne null pour une chaine vide', () => {
    expect(parseDuree('')).toBeNull();
  });

  it('retourne null pour une valeur negative', () => {
    expect(parseDuree('-0.5')).toBeNull();
  });

  it('retourne null pour du texte', () => {
    expect(parseDuree('abc')).toBeNull();
  });

  it('arrondit a 2 decimales', () => {
    expect(parseDuree('0.333')).toBe(0.33);
  });
});
