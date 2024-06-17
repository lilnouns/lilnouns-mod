import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import prettier from 'eslint-plugin-prettier'
import regexp from 'eslint-plugin-regexp'
import unicorn from 'eslint-plugin-unicorn'
import vitest from 'eslint-plugin-vitest'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // config with just ignores is the replacement for `.eslintignore`
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/test/*',
      '**/*.config.js',
    ],
  },

  // extends ...
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...[
    prettierConfig,
    jsdoc.configs['flat/recommended-typescript-error'],
    regexp.configs['flat/recommended'],
  ],

  {
    plugins: {
      unicorn,
      prettier,
    },
    rules: {
      ...unicorn.rules.recommended,
    },
  },

  // base config
  {
    languageOptions: {
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        allowAutomaticSingleRunInference: true,
      },
    },
    plugins: {
      unicorn,
      prettier,
    },
    rules: {
      ...unicorn.rules.recommended,
    },
  },

  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    files: ['**/*.spec.js', '**/*.test.js'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.all.rules,
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },
)
