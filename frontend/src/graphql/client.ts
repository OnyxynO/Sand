import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Cle de stockage du token
const TOKEN_KEY = 'sand_auth_token';

// Fonctions utilitaires pour le token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Lien HTTP de base
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql',
  credentials: 'include', // Pour Sanctum (cookies)
});

// Lien pour ajouter le token d'authentification
const authLink = setContext((_, { headers }) => {
  const token = getToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Client Apollo
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
