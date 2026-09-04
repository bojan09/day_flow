// Config: ESLint — narrow on purpose.
// The point of adding this is the react-hooks rules: exhaustive-deps and
// rules-of-hooks catch the stale-closure / conditional-hook bugs that this
// codebase has actually shipped. Stylistic rules are left off so the lint
// output stays signal.
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/sw.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      react,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Without this, ESLint does not treat <Foo /> as a reference to Foo, so
      // component imports and component-valued props look unused. The uppercase
      // varsIgnorePattern below used to mask that for imports — which also hid
      // genuinely unused ones.
      'react/jsx-uses-vars': 'error',
      'react-refresh/only-export-components': 'off',
      // Unused vars are worth seeing, but not as a build-blocking error while
      // the existing backlog is still being worked through.
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      // `catch {}` is used deliberately throughout for best-effort operations
      // (localStorage in private mode, realtime teardown).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Off by decision, not by accident. Every occurrence in this codebase is
      // a deliberate pattern the rule cannot distinguish from a mistake:
      // syncing props to state when a different record is opened, an async
      // load resolving, or a subscription handler. Leaving ~20 permanent
      // warnings would train us to skim past lint output, which is how the
      // genuine hook-order bugs went unnoticed in the first place. The rules
      // that catch real defects here — rules-of-hooks, exhaustive-deps,
      // immutability, purity, no-undef — stay on.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
]
