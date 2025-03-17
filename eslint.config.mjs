import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  globalIgnores(['.millennium/', '.venv/']),
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginJs.configs.all,
  ...tseslint.configs.all,
  stylistic.configs.all,
  stylistic.configs['disable-legacy'],
  stylistic.configs.customize({
    indent: 2,
    semi: true,
    quotes: 'single',
    braceStyle: '1tbs',
    blockSpacing: true,
    commaDangle: 'always-multiline',
  }),
  {
    rules: {
      // #region Formatting preferences
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/member-delimiter-style': ['error', { singleline: { requireLast: true } }],
      '@stylistic/newline-per-chained-call': ['error', { ignoreChainWithDepth: 3 }],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: ['return', 'function', 'class', 'interface', 'type', 'enum'] },
      ],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      curly: ['error', 'multi-line'],

      '@stylistic/array-element-newline': 'off',
      '@stylistic/implicit-arrow-linebreak': 'off',
      '@stylistic/lines-around-comment': 'off',
      '@stylistic/multiline-comment-style': 'off',
      '@stylistic/object-property-newline': 'off',
      // #endregion

      // #region Preferences
      '@typescript-eslint/method-signature-style': ['error', 'method'],
      '@typescript-eslint/prefer-literal-enum-member': ['error', { allowBitwiseExpressions: true }],
      'func-style': ['error', 'declaration'],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],

      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/parameter-properties': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/prefer-enum-initializers': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      'capitalized-comments': 'off',
      'guard-for-in': 'off',
      'id-length': 'off',
      'max-lines': 'off',
      'max-statements': 'off',
      'no-bitwise': 'off',
      'no-continue': 'off',
      'no-inline-comments': 'off',
      'no-negated-condition': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-ternary': 'off',
      'no-undefined': 'off',
      'no-warning-comments': 'off',
      'one-var': 'off',
      'prefer-named-capture-group': 'off',
      radix: 'off',
      'require-unicode-regexp': 'off',
      'sort-imports': 'off',
      'sort-keys': 'off',
      // #endregion

      // #region Project specific
      '@typescript-eslint/member-ordering': ['error', { default: ['method', 'field'] }],

      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-console': 'off',
      'no-alert': 'off',
      // #endregion
    },
  },
);
