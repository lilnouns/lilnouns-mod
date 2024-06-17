import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  prettierConfig,
  {
    ignores: ['test/*', 'dist/*', '**/*.config.js'],
  },
  {
    plugins: {
      prettier,
    },
  },
  {
    plugins: {
      unicorn,
    },
    rules: {
      ...unicorn.rules.recommended,
      'unicorn/prevent-abbreviations': 'off',
    },
  },
)
