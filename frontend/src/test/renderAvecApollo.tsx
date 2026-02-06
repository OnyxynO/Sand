/**
 * Utilitaire de test pour remplacer MockedProvider (supprime en Apollo Client 4).
 * Utilise MockLink + ApolloClient + ApolloProvider.
 */
import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing'

export interface MockGraphQL {
  request: {
    query: unknown
    variables?: Record<string, unknown>
  }
  result?: {
    data: unknown
  }
  error?: Error
  delay?: number
  maxUsageCount?: number
}

export function renderAvecApollo(
  ui: React.ReactElement,
  mocks: MockGraphQL[] = [],
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Ajouter delay: 0 pour reponse immediate si pas specifie
  const mocksAvecDelai = mocks.map((m) => ({
    ...m,
    delay: m.delay ?? 0,
    maxUsageCount: m.maxUsageCount ?? Infinity,
  }))
  const mockLink = new MockLink(mocksAvecDelai as never[])
  const client = new ApolloClient({
    link: mockLink,
    cache: new InMemoryCache(),
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
