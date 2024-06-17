import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import prettier from 'eslint-plugin-prettier'
import unicorn from 'eslint-plugin-unicorn'
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
  ...[prettierConfig, jsdoc.configs['flat/recommended-typescript-error']],

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
      'unicorn/prevent-abbreviations': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },

  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
)
