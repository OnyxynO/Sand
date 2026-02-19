import { ApolloClient, ApolloLink, InMemoryCache, createHttpLink } from '@apollo/client';

// Client Apollo — authentification via cookies Sanctum (HttpOnly)
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql',
  credentials: 'include',
});

// Ajoute X-XSRF-TOKEN requis par Sanctum SPA (EnsureFrontendRequestsAreStateful)
const csrfLink = new ApolloLink((operation, forward) => {
  const xsrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  if (xsrfToken) {
    operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
      headers: { ...headers, 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) },
    }));
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([csrfLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: { keyFields: ['id'] },
      Project: { keyFields: ['id'] },
      Activity: { keyFields: ['id'] },
      Team: { keyFields: ['id'] },
      TimeEntry: { keyFields: ['id'] },
      Absence: { keyFields: ['id'] },
      Notification: { keyFields: ['id'] },
      Setting: { keyFields: ['id'] },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
