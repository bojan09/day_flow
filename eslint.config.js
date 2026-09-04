// Config: ESLint — narrow on purpose.
// The point of adding this is the react-hooks rules: exhaustive-deps and
// rules-of-hooks catch the stale-closure / conditional-hook bugs that this
// codebase has actually shipped. Stylistic rules are left off so the lint
// output stays signal.
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
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
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      // Unused vars are worth seeing, but not as a build-blocking error while
      // the existing backlog is still being worked through.
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // `catch {}` is used deliberately throughout for best-effort operations
      // (localStorage in private mode, realtime teardown).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // These three flag real-but-latent concurrent-rendering hazards rather
      // than present-day breakage; kept visible as warnings so the genuine
      // hook-order and undefined-variable errors stay readable.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
]
