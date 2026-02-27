import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  // Schema depuis le backend (introspection HTTP en dev, fichier local en Docker build via CODEGEN_SCHEMA)
  schema: process.env.CODEGEN_SCHEMA ?? 'http://localhost:8080/graphql',

  // Fichiers contenant les operations GraphQL
  documents: ['src/**/*.ts', 'src/**/*.tsx'],

  // Ignorer les fichiers generes
  ignoreNoDocuments: true,

  generates: {
    // Generer les types dans src/gql/
    './src/gql/': {
      preset: 'client',
      config: {
        // Utiliser les enums TypeScript
        enumsAsTypes: true,
        // Noms des operations en camelCase
        namingConvention: 'keep',
        // Ajouter __typename pour le cache Apollo
        addTypename: true,
        // Utiliser import type pour compatibilite verbatimModuleSyntax
        useTypeImports: true,
      },
      presetConfig: {
        // Fragment masking pour meilleure isolation
        fragmentMasking: false,
      },
    },
  },

}

export default config
