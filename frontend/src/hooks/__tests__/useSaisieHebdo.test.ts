import { describe, it, expect } from 'vitest';
import { transformerAbsences } from '../useSaisieHebdo';
import type { AbsenceAPI } from '../../types';

describe('transformerAbsences', () => {
  const semaine = '2026-W03'; // Lundi 12 jan - Dimanche 18 jan 2026

  it('retourne un objet vide sans absences', () => {
    const resultat = transformerAbsences([], semaine);
    expect(resultat).toEqual({});
  });

  it('transforme une absence d\'un seul jour', () => {
    const absences: AbsenceAPI[] = [
      {
        id: '1',
        type: 'rtt',
        typeLibelle: 'RTT',
        dateDebut: '2026-01-14',
        dateFin: '2026-01-14',
        dureeJournaliere: 1.0,
      },
    ];

    const resultat = transformerAbsences(absences, semaine);

    expect(Object.keys(resultat)).toHaveLength(1);
    expect(resultat['2026-01-14']).toEqual({
      type: 'rtt',
      typeLibelle: 'RTT',
      dureeJournaliere: 1.0,
    });
  });

  it('transforme une absence sur plusieurs jours', () => {
    const absences: AbsenceAPI[] = [
      {
        id: '1',
        type: 'conge',
        typeLibelle: 'Conge',
        dateDebut: '2026-01-12',
        dateFin: '2026-01-16',
        dureeJournaliere: 1.0,
      },
    ];

    const resultat = transformerAbsences(absences, semaine);

    // 5 jours : lundi 12 au vendredi 16
    expect(Object.keys(resultat)).toHaveLength(5);
    expect(resultat['2026-01-12']).toBeDefined();
    expect(resultat['2026-01-16']).toBeDefined();
    expect(resultat['2026-01-12'].type).toBe('conge');
  });

  it('borne une absence qui deborde avant la semaine', () => {
    const absences: AbsenceAPI[] = [
      {
        id: '1',
        type: 'maladie',
        typeLibelle: 'Maladie',
        dateDebut: '2026-01-08', // Jeudi de la semaine precedente
        dateFin: '2026-01-14',   // Mercredi de cette semaine
        dureeJournaliere: 1.0,
      },
    ];

    const resultat = transformerAbsences(absences, semaine);

    // Seulement lundi 12, mardi 13, mercredi 14 (borne au lundi de la semaine)
    expect(Object.keys(resultat)).toHaveLength(3);
    expect(resultat['2026-01-12']).toBeDefined();
    expect(resultat['2026-01-14']).toBeDefined();
    // Le jeudi 8 et vendredi 9 de la semaine precedente ne doivent pas apparaitre
    expect(resultat['2026-01-08']).toBeUndefined();
  });

  it('borne une absence qui deborde apres la semaine', () => {
    const absences: AbsenceAPI[] = [
      {
        id: '1',
        type: 'formation',
        typeLibelle: 'Formation',
        dateDebut: '2026-01-16', // Vendredi de cette semaine
        dateFin: '2026-01-22',   // Jeudi de la semaine suivante
        dureeJournaliere: 1.0,
      },
    ];

    const resultat = transformerAbsences(absences, semaine);

    // Vendredi 16, samedi 17, dimanche 18 (borne au dimanche)
    expect(resultat['2026-01-16']).toBeDefined();
    expect(resultat['2026-01-18']).toBeDefined();
    // Le lundi 19 de la semaine suivante ne doit pas apparaitre
    expect(resultat['2026-01-19']).toBeUndefined();
  });

  it('ignore une absence completement hors de la semaine', () => {
    const absences: AbsenceAPI[] = [
      {
        id: '1',
        type: 'conge',
        typeLibelle: 'Conge',
        dateDebut: '2026-01-05',
        dateFin: '2026-01-09',
        dureeJournaliere: 1.0,
      },
    ];

    const resultat = transformerAbsences(absences, semaine);
    expect(resultat).toEqual({});
  });

  it('gere plusieurs absences dans la meme semaine', () => {
    const absences: AbsenceAPI[] = [
      {
        id: '1',
        type: 'rtt',
        typeLibelle: 'RTT',
        dateDebut: '2026-01-12',
        dateFin: '2026-01-12',
        dureeJournaliere: 1.0,
      },
      {
        id: '2',
        type: 'conge',
        typeLibelle: 'Conge',
        dateDebut: '2026-01-15',
        dateFin: '2026-01-16',
        dureeJournaliere: 1.0,
      },
    ];

    const resultat = transformerAbsences(absences, semaine);

    expect(Object.keys(resultat)).toHaveLength(3);
    expect(resultat['2026-01-12'].type).toBe('rtt');
    expect(resultat['2026-01-15'].type).toBe('conge');
    expect(resultat['2026-01-16'].type).toBe('conge');
  });

  it('conserve la duree journaliere de demi-journee', () => {
    const absences: AbsenceAPI[] = [
      {
        id: '1',
        type: 'conge',
        typeLibelle: 'Conge (matin)',
        dateDebut: '2026-01-14',
        dateFin: '2026-01-14',
        dureeJournaliere: 0.5,
      },
    ];

    const resultat = transformerAbsences(absences, semaine);

    expect(resultat['2026-01-14'].dureeJournaliere).toBe(0.5);
    expect(resultat['2026-01-14'].typeLibelle).toBe('Conge (matin)');
  });
});
