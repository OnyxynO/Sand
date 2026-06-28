import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import * as Sentry from '@sentry/react'
import { apolloClient } from './graphql/client'
import './index.css'
import App from './App.tsx'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
  // Bruit reseau benin : requetes coupees (onglet ferme, polling health-check
  // interrompu, crawlers headless). Aucun utilisateur impacte — voir SAND-4.
  ignoreErrors: ['Failed to fetch', 'NetworkError when attempting to fetch resource', 'AbortError'],
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)
