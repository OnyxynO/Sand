import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Client Apollo — authentification via cookies Sanctum (HttpOnly)
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql',
  credentials: 'include',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
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
