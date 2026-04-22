import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import-x'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.vite/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      ...tseslint.configs['strict']?.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      'import/no-default-export': 'warn',
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...vuePlugin.configs['strongly-recommended']?.rules,
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-props-declaration': ['error', 'type-based'],
    },
  },
  {
    files: ['**/lib/logger.ts', '**/build.ts'],
    rules: { 'no-console': 'off' },
  },
]
