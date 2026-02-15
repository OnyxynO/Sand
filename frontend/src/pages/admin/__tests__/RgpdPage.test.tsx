import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderAvecApollo } from '../../../test/renderAvecApollo';
import RgpdPage from '../RgpdPage';
import { USERS_QUERY } from '../../../graphql/operations/users';
import {
  SUPPRIMER_DONNEES_UTILISATEUR,
  PURGER_TOUTES_DONNEES,
} from '../../../graphql/operations/rgpd';

vi.mock('../../../components/admin/NavAdmin', () => ({
  default: () => <nav data-testid="nav-admin">NavAdmin</nav>,
}));

const usersResultData = {
  users: {
    __typename: 'UserPaginator',
    data: [
      { __typename: 'User', id: '1', matricule: 'ADM001', nom: 'Admin', prenom: 'Super', nomComplet: 'Super Admin', email: 'admin@sand.local', role: 'admin', estActif: true, equipe: null, createdAt: '2026-01-01' },
      { __typename: 'User', id: '2', matricule: 'USR001', nom: 'Martin', prenom: 'Jean', nomComplet: 'Jean Martin', email: 'jean@sand.local', role: 'utilisateur', estActif: true, equipe: null, createdAt: '2026-01-01' },
    ],
    paginatorInfo: { __typename: 'PaginatorInfo', currentPage: 1, lastPage: 1, total: 2, hasMorePages: false },
  },
};

const creerUsersMock = () => ({
  request: {
    query: USERS_QUERY,
    variables: { actifSeulement: false },
  },
  result: { data: usersResultData },
  maxUsageCount: Infinity,
});

const suppressionMock = {
  request: {
    query: SUPPRIMER_DONNEES_UTILISATEUR,
    variables: { userId: '2', confirmationNom: 'Jean Martin' },
  },
  result: {
    data: {
      supprimerDonneesUtilisateur: {
        saisiesSupprimees: 5,
        absencesSupprimees: 2,
        notificationsSupprimees: 1,
        exportsSupprimees: 0,
        logsAnonymises: 8,
      },
    },
  },
};

const purgeMock = {
  request: {
    query: PURGER_TOUTES_DONNEES,
    variables: { confirmationPhrase: 'CONFIRMER SUPPRESSION' },
  },
  result: {
    data: {
      purgerToutesDonnees: {
        saisiesSupprimees: 100,
        logsSupprimees: 200,
        absencesSupprimees: 10,
        notificationsSupprimees: 5,
        exportsSupprimees: 3,
      },
    },
  },
};

// Helper : attend que le select soit charge avec les options
const attendreChargement = async () => {
  await waitFor(() => {
    const select = screen.getByLabelText('Selectionner un utilisateur') as HTMLSelectElement;
    // Le select doit avoir plus d'une option (le placeholder + les utilisateurs)
    expect(select.options.length).toBeGreaterThan(1);
  });
};

// Helper : selectionner Jean Martin et ouvrir la modale de suppression
const selectionnerEtOuvrirModale = async () => {
  await attendreChargement();
  fireEvent.change(screen.getByLabelText('Selectionner un utilisateur'), { target: { value: '2' } });
  fireEvent.click(screen.getByText(/Supprimer les donnees de Jean Martin/));
};

describe('RgpdPage', () => {
  it('affiche le titre et les deux sections', () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock()]);

    expect(screen.getByText('RGPD - Gestion des donnees')).toBeInTheDocument();
    expect(screen.getByText(/Suppression des donnees d'un utilisateur/)).toBeInTheDocument();
    expect(screen.getByText(/Purge totale des donnees/)).toBeInTheDocument();
  });

  it('affiche la liste des utilisateurs apres chargement', async () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock()]);

    await attendreChargement();

    const select = screen.getByLabelText('Selectionner un utilisateur') as HTMLSelectElement;
    // Placeholder + 2 utilisateurs
    expect(select.options.length).toBe(3);
  });

  it('affiche le bouton de suppression apres selection', async () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock()]);

    await attendreChargement();

    fireEvent.change(screen.getByLabelText('Selectionner un utilisateur'), { target: { value: '2' } });

    expect(screen.getByText(/Supprimer les donnees de Jean Martin/)).toBeInTheDocument();
  });

  it('ouvre la modale de suppression', async () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock()]);

    await selectionnerEtOuvrirModale();

    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
  });

  it('bouton supprimer desactive tant que nom incorrect', async () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock()]);

    await selectionnerEtOuvrirModale();

    const boutonSupprimer = screen.getByText('Supprimer definitivement');
    expect(boutonSupprimer).toBeDisabled();

    const input = screen.getByTestId('input-confirmation-nom');
    fireEvent.change(input, { target: { value: 'Mauvais' } });
    expect(boutonSupprimer).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Jean Martin' } });
    expect(boutonSupprimer).not.toBeDisabled();
  });

  it('affiche les resultats apres suppression', async () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock(), suppressionMock]);

    await selectionnerEtOuvrirModale();

    const input = screen.getByTestId('input-confirmation-nom');
    fireEvent.change(input, { target: { value: 'Jean Martin' } });
    fireEvent.click(screen.getByText('Supprimer definitivement'));

    await waitFor(() => {
      expect(screen.getByText(/5 saisie\(s\) supprimee\(s\)/)).toBeInTheDocument();
      expect(screen.getByText(/2 absence\(s\) supprimee\(s\)/)).toBeInTheDocument();
      expect(screen.getByText(/8 log\(s\) anonymise\(s\)/)).toBeInTheDocument();
    });
  });

  it('ouvre la modale de purge', () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock()]);

    const boutons = screen.getAllByRole('button', { name: /Purger toutes les donnees/ });
    fireEvent.click(boutons[0]);

    expect(screen.getByText('Purge totale - Confirmation')).toBeInTheDocument();
  });

  it('bouton purge desactive tant que phrase incorrecte', () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock()]);

    const boutonSection = screen.getAllByRole('button', { name: /Purger toutes les donnees/ })[0];
    fireEvent.click(boutonSection);

    const boutonModale = screen.getAllByRole('button', { name: /Purger toutes les donnees/ }).pop()!;
    expect(boutonModale).toBeDisabled();

    const input = screen.getByTestId('input-confirmation-purge');
    fireEvent.change(input, { target: { value: 'CONFIRMER SUPPRESSION' } });
    expect(boutonModale).not.toBeDisabled();
  });

  it('affiche les resultats apres purge', async () => {
    renderAvecApollo(<RgpdPage />, [creerUsersMock(), purgeMock]);

    const boutonSection = screen.getAllByRole('button', { name: /Purger toutes les donnees/ })[0];
    fireEvent.click(boutonSection);

    const input = screen.getByTestId('input-confirmation-purge');
    fireEvent.change(input, { target: { value: 'CONFIRMER SUPPRESSION' } });

    const boutonModale = screen.getAllByRole('button', { name: /Purger toutes les donnees/ }).pop()!;
    fireEvent.click(boutonModale);

    await waitFor(() => {
      expect(screen.getByText(/100 saisie\(s\) supprimee\(s\)/)).toBeInTheDocument();
      expect(screen.getByText(/200 log\(s\) supprime\(s\)/)).toBeInTheDocument();
    });
  });
});
