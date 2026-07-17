import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // sniff-tests/ et les dossiers associés (.sniff, sniff-baselines, sniff-reports) sont des
  // artefacts générés par un outil de QA visuelle (screenshots + baselines), gitignorés et
  // non inclus dans tsconfig.app.json — à exclure du lint comme dist.
  globalIgnores(['dist', 'sniff-tests', 'sniff-baselines', 'sniff-reports', '.sniff']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
