// @ts-check
import antfu from '@antfu/eslint-config'
import packageJson from 'eslint-plugin-package-json'
import nuxt from './.nuxt/eslint.config.mjs'

export default antfu(
  {
    formatters: true,
    markdown: false,
    stylistic: false,
    jsonc: false,
    pnpm: true,
  },
  {
    ignores: ['.vscode/**/*.md'],
  },
  {
    rules: {
      'style/no-tabs': 'off',
      'style/no-mixed-spaces-and-tabs': 'off',
      'ts/method-signature-style': 'off',
      'ts/no-use-before-define': 'off',
      'node/prefer-global/process': 'off',
    },
  },
  packageJson.configs.recommended,
)
  .append(nuxt())
  .append({
    files: ['**/*.vue'],
    name: 'antfu/vue/recommended',
    rules: {
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script:not([setup])', 'script[setup]', 'style:not([scoped])', 'style[scoped]'],
        },
      ],
      'vue/html-self-closing': [
        'warn',
        {
          html: {
            void: 'always',
            normal: 'never',
          },
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: { max: 10 },
          multiline: { max: 1 },
        },
      ],
      'vue/custom-event-name-casing': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'import/first': 'off',
      'import/consistent-type-specifier-style': 'off',
    },
  })
  .append({
    files: ['pnpm-workspace.yaml'],
    name: 'antfu/yaml/pnpm-workspace',
    rules: {
      'yaml/sort-keys': [
        'error',
        {
          order: [
            'packages',
            'overrides',
            'patchedDependencies',
            'hoistPattern',
            'catalog',
            'catalogs',

            'allowedDeprecatedVersions',
            'allowNonAppliedPatches',
            'configDependencies',
            'ignoredBuiltDependencies',
            'ignoredOptionalDependencies',
            'neverBuiltDependencies',
            'onlyBuiltDependencies',
            'onlyBuiltDependenciesFile',
            'packageExtensions',
            'peerDependencyRules',
            'supportedArchitectures',
          ],
          pathPattern: '^$',
        },
        {
          order: { type: 'asc' },
          pathPattern: '.*',
        },
      ],
    },
  })
