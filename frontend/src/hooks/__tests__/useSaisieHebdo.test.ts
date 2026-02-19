import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { transformerAbsences, useSaisieHebdo } from '../useSaisieHebdo';
import { MES_SAISIES_SEMAINE, ABSENCES_SEMAINE, SYNC_ABSENCES } from '../../graphql/operations/saisie';
import type { AbsenceAPI } from '../../types';

// Mock du store Zustand pour isoler les tests du hook
vi.mock('../../stores/saisieStore', () => ({
  useSaisieStore: vi.fn(),
}));

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

// ─── U-V08 : useSaisieHebdo hook ──────────────────────────────────────────────

import { useSaisieStore } from '../../stores/saisieStore';

describe('useSaisieHebdo', () => {
  // Semaine 2026-W07 : lundi 9 fev – dimanche 15 fev 2026
  const SEMAINE = '2026-W07';
  const DATE_DEBUT = '2026-02-09';
  const DATE_FIN = '2026-02-15';

  const mockChargerSaisies = vi.fn();
  const mockSetChargement = vi.fn();
  const mockSetErreur = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSaisieStore).mockReturnValue({
      semaineISO: SEMAINE,
      lignes: [],
      jours: [],
      chargement: false,
      sauvegarde: false,
      erreur: null,
      chargerSaisies: mockChargerSaisies,
      reinitialiserModifications: vi.fn(),
      setChargement: mockSetChargement,
      setSauvegarde: vi.fn(),
      setErreur: mockSetErreur,
      aDifficultes: vi.fn().mockReturnValue(false),
      getModifications: vi.fn().mockReturnValue({ nouvelles: [], modifiees: [], supprimees: [] }),
      ajouterLigne: vi.fn(),
      supprimerLigne: vi.fn(),
      modifierCellule: vi.fn(),
      getTotalJour: vi.fn().mockReturnValue(0),
      getTotalLigne: vi.fn().mockReturnValue(0),
      setSemaine: vi.fn(),
      allerSemainePrecedente: vi.fn(),
      allerSemaineSuivante: vi.fn(),
      allerSemaineActuelle: vi.fn(),
    } as never);
  });

  // U-V08 : charge les saisies de la semaine au montage
  it('charge les saisies de la semaine au montage', async () => {
    // __typename requis pour la normalisation InMemoryCache (Apollo Client)
    const saisiesMock = [
      {
        __typename: 'TimeEntry',
        id: '1',
        date: '2026-02-10',
        duree: 0.5,
        commentaire: null,
        projet: { __typename: 'Project', id: 'p1', nom: 'Projet Alpha', code: 'PA' },
        activite: { __typename: 'Activity', id: 'a1', nom: 'Developpement', chemin: '1.2', cheminComplet: 'Backend > Dev' },
      },
    ];

    const mocks = [
      {
        request: { query: MES_SAISIES_SEMAINE, variables: { semaine: SEMAINE } },
        result: { data: { mesSaisiesSemaine: saisiesMock } },
        delay: 0,
        maxUsageCount: Infinity,
      },
      {
        request: { query: SYNC_ABSENCES, variables: { dateDebut: DATE_DEBUT, dateFin: DATE_FIN } },
        result: { data: { syncAbsences: { __typename: 'SyncAbsencesResult', importes: 0, conflits: 0, erreurs: 0 } } },
        delay: 0,
        maxUsageCount: Infinity,
      },
      {
        request: { query: ABSENCES_SEMAINE, variables: { dateDebut: DATE_DEBUT, dateFin: DATE_FIN } },
        result: { data: { absences: [] } },
        delay: 0,
        maxUsageCount: Infinity,
      },
    ];

    const mockLink = new MockLink(mocks as never[]);
    const client = new ApolloClient({ link: mockLink, cache: new InMemoryCache() });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ApolloProvider, { client }, children);

    renderHook(() => useSaisieHebdo(), { wrapper });

    await waitFor(() => {
      expect(mockChargerSaisies).toHaveBeenCalledTimes(1);
    });

    // Verifie que les donnees Apollo sont passees a chargerSaisies
    const appelArg = mockChargerSaisies.mock.calls[0][0];
    expect(appelArg).toHaveLength(1);
    expect(appelArg[0].id).toBe('1');
    expect(appelArg[0].duree).toBe(0.5);
    expect(appelArg[0].projet.id).toBe('p1');
    expect(appelArg[0].activite.nom).toBe('Developpement');
  });
});
