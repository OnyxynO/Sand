import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderAvecApollo } from '../../test/renderAvecApollo';
import ConfigurationPage from './ConfigurationPage';
import { PARAMETRES_QUERY } from '../../graphql/operations/settings';

// Mock NavAdmin pour eviter le besoin de Router context
vi.mock('../../components/admin/NavAdmin', () => ({
  default: () => <nav data-testid="nav-admin">NavAdmin</nav>,
}));

const parametresMock = {
  request: {
    query: PARAMETRES_QUERY,
  },
  result: {
    data: {
      parametres: [
        { id: '1', cle: 'delai_annulation', valeur: 5, description: 'Delai' },
        { id: '2', cle: 'afficher_weekends', valeur: false, description: 'Weekends' },
        { id: '3', cle: 'premier_jour_semaine', valeur: 1, description: 'Premier jour' },
        { id: '4', cle: 'jours_retroactifs', valeur: 7, description: 'Retroactifs' },
        { id: '5', cle: 'periode_saisie_defaut', valeur: 'semaine', description: 'Periode' },
        { id: '6', cle: 'rappel_saisie_actif', valeur: true, description: 'Rappels' },
      ],
    },
  },
};

describe('ConfigurationPage', () => {
  it('affiche le titre', async () => {
    renderAvecApollo(<ConfigurationPage />, [parametresMock]);
    expect(screen.getByText('Configuration systeme')).toBeInTheDocument();
  });

  it('affiche le spinner pendant le chargement', () => {
    renderAvecApollo(<ConfigurationPage />, [parametresMock]);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('affiche les champs de configuration apres chargement', async () => {
    renderAvecApollo(<ConfigurationPage />, [parametresMock]);

    await waitFor(() => {
      expect(screen.getByText("Delai d'annulation (secondes)")).toBeInTheDocument();
    });

    expect(screen.getByText('Afficher les weekends')).toBeInTheDocument();
    expect(screen.getByText('Premier jour de la semaine')).toBeInTheDocument();
    expect(screen.getByText('Jours retroactifs')).toBeInTheDocument();
    expect(screen.getByText("Periode d'affichage par defaut")).toBeInTheDocument();
    expect(screen.getByText('Rappels de saisie')).toBeInTheDocument();
  });

  it('bouton enregistrer est desactive par defaut', async () => {
    renderAvecApollo(<ConfigurationPage />, [parametresMock]);

    await waitFor(() => {
      expect(screen.getByText("Delai d'annulation (secondes)")).toBeInTheDocument();
    });

    const bouton = screen.getByText('Enregistrer');
    expect(bouton).toBeDisabled();
  });

  it('bouton enregistrer s\'active apres modification', async () => {
    renderAvecApollo(<ConfigurationPage />, [parametresMock]);

    await waitFor(() => {
      expect(screen.getByText("Delai d'annulation (secondes)")).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '10' } });

    const bouton = screen.getByText('Enregistrer');
    expect(bouton).not.toBeDisabled();
  });

  it('affiche erreur si query echoue', async () => {
    const errorMock = {
      request: { query: PARAMETRES_QUERY },
      error: new Error('Erreur serveur'),
    };

    renderAvecApollo(<ConfigurationPage />, [errorMock]);

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement/)).toBeInTheDocument();
    });
  });
});
