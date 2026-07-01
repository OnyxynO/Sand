import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  // Schema depuis le fichier SDL local (genere par `php artisan lighthouse:print-schema`).
  // Evite l'introspection HTTP, bloquee par la limite de securite max_query_depth = 7
  // de Lighthouse (une requete d'introspection depasse cette profondeur). Codegen
  // fonctionne ainsi sans backend qui tourne. Regenerer schema.graphql apres toute
  // modification du schema GraphQL cote backend (voir `bun run schema`).
  schema: './schema.graphql',

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
