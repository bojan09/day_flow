import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js', 'tailwind.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      // The legacy codebase has a large unused-symbol backlog. Keep correctness
      // rules blocking while later feature work removes dead code it touches.
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.test.js', 'api/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
  {
    files: ['public/sw.js', 'public/push/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.es2022,
      },
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': 'off',
    },
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['supabase/functions/**/*.ts'],
    languageOptions: {
      ...config.languageOptions,
      globals: {
        ...globals.browser,
        Deno: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  })),
]
