// Tests pour LoginPage - verifie le filtrage des espaces dans l'email (bug #36)

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderAvecApollo } from '../test/renderAvecApollo';
import LoginPage from './LoginPage';
import { LOGIN_MUTATION } from '../graphql/operations/auth';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock authStore
vi.mock('../stores/authStore', () => ({
  useAuthStore: () => vi.fn(),
}));

// Mock import.meta.env.DEV
vi.stubGlobal('import', { meta: { env: { DEV: false } } });

describe('LoginPage', () => {
  it('affiche le formulaire de connexion', () => {
    renderAvecApollo(<LoginPage />);

    expect(screen.getByText('SAND')).toBeInTheDocument();
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  it('filtre les espaces en temps reel dans le champ email', () => {
    renderAvecApollo(<LoginPage />);

    const emailInput = screen.getByLabelText('Adresse email');

    fireEvent.change(emailInput, { target: { value: 'test @email.com' } });
    expect(emailInput).toHaveValue('test@email.com');
  });

  it('filtre les espaces en fin de saisie email', () => {
    renderAvecApollo(<LoginPage />);

    const emailInput = screen.getByLabelText('Adresse email');

    fireEvent.change(emailInput, { target: { value: 'test@email.com ' } });
    expect(emailInput).toHaveValue('test@email.com');
  });

  it('filtre les tabulations dans le champ email', () => {
    renderAvecApollo(<LoginPage />);

    const emailInput = screen.getByLabelText('Adresse email');

    fireEvent.change(emailInput, { target: { value: 'test@email.com\t' } });
    expect(emailInput).toHaveValue('test@email.com');
  });

  it('filtre les espaces multiples dans le champ email', () => {
    renderAvecApollo(<LoginPage />);

    const emailInput = screen.getByLabelText('Adresse email');

    fireEvent.change(emailInput, { target: { value: ' t e s t @ e m a i l . c o m ' } });
    expect(emailInput).toHaveValue('test@email.com');
  });

  it('affiche erreur si champs vides au submit', async () => {
    renderAvecApollo(<LoginPage />);

    fireEvent.click(screen.getByText('Se connecter'));

    await waitFor(() => {
      expect(screen.getByText('Veuillez remplir tous les champs')).toBeInTheDocument();
    });
  });

  it('champ email a type="email"', () => {
    renderAvecApollo(<LoginPage />);

    const emailInput = screen.getByLabelText('Adresse email');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('desactive les champs pendant le chargement', async () => {
    const loginMock = {
      request: {
        query: LOGIN_MUTATION,
        variables: { input: { email: 'test@test.com', password: 'password' } },
      },
      result: {
        data: {
          login: {
            user: { id: '1', nom: 'Test', prenom: 'User', email: 'test@test.com', role: 'UTILISATEUR', equipe: null },
            token: 'fake-token',
          },
        },
      },
      delay: 1000, // Delai pour observer l'etat loading
    };

    renderAvecApollo(<LoginPage />, [loginMock]);

    const emailInput = screen.getByLabelText('Adresse email');
    const passwordInput = screen.getByLabelText('Mot de passe');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Se connecter'));

    await waitFor(() => {
      expect(screen.getByText('Connexion en cours…')).toBeInTheDocument();
    });
  });
});
