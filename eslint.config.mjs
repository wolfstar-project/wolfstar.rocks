// @ts-check
import antfu from "@antfu/eslint-config";
import packageJson from "eslint-plugin-package-json";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  antfu(
    {
      vue: true,
      formatters: true,
      pnpm: true,
      stylistic: {
        indent: 2,
        quotes: "double",
        semi: true,
        jsx: true,
      },
    },
    {
      ignores: [".vscode/**/*.md", ".trae/", "AGENTS.md"],
    },
  ),
).append({
  files: ["**/*.css"],
  rules: {
    "format/prettier": ["error", {
      parser: "css",
      printWidth: 150,
      quoteProps: "as-needed",
      semi: true,
      singleQuote: true,
      tabWidth: 4,
      trailingComma: "none",
      useTabs: true,
      plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-css-order"],
      tailwindFunctions: ["tv", "cn"],
      tailwindStylesheet: "./app/assets/css/main.css",
    }],
  },
}).append({
  files: ["README.md"],
  rules: {
    "format/prettier": ["error", {
      endOfLine: "lf",
      quoteProps: "as-needed",
      singleQuote: true,
      trailingComma: "none",
      parser: "markdown",
      tabWidth: 2,
      useTabs: false,
      printWidth: 80,
      proseWrap: "always",
    }],
  },
}).append({ ...packageJson.configs.recommended, files: ["package.json"], name: "antfu/json/package", rules: {
  "jsonc/sort-keys": "off",
  "jsonc/indent": "off",
} }).append({
  files: ["**/*.vue"],
  name: "antfu/vue/recommended",
  rules: {
    "vue/block-order": [
      "error",
      {
        order: ["template", "script:not([setup])", "script[setup]", "style:not([scoped])", "style[scoped]"],
      },
    ],
    "vue/html-self-closing": [
      "warn",
      {
        html: {
          void: "always",
          normal: "never",
        },
      },
    ],
    "vue/max-attributes-per-line": [
      "error",
      {
        singleline: { max: 10 },
        multiline: { max: 1 },
      },
    ],
    "vue/custom-event-name-casing": "off",
    "vue/no-multiple-template-root": "off",
    "vue/singleline-html-element-content-newline": "off",
    "import/first": "off",
    "import/consistent-type-specifier-style": "off",
  },
}).append({
  files: ["pnpm-workspace.yaml"],
  name: "antfu/yaml/pnpm-workspace",
  rules: {
    "yaml/sort-keys": [
      "error",
      {
        order: [
          "packages",
          "overrides",
          "patchedDependencies",
          "hoistPattern",
          "catalog",
          "catalogs",

          "allowedDeprecatedVersions",
          "allowNonAppliedPatches",
          "configDependencies",
          "ignoredBuiltDependencies",
          "ignoredOptionalDependencies",
          "neverBuiltDependencies",
          "onlyBuiltDependencies",
          "onlyBuiltDependenciesFile",
          "packageExtensions",
          "peerDependencyRules",
          "supportedArchitectures",
        ],
        pathPattern: "^$",
      },
      {
        order: { type: "asc" },
        pathPattern: ".*",
      },
    ],
  },
}).overrideRules({
  "ts/method-signature-style": "off",
  "ts/no-use-before-define": "off",
  // ts/ban-types has been deprecated - using modern alternatives instead
  "ts/no-empty-object-type": "warn", // Modern replacement for part of ban-types
  "ts/no-wrapper-object-types": "warn", // Modern replacement for part of ban-types
  "ts/no-explicit-any": "off",
  "vue/comma-dangle": "off",
  "vue/eqeqeq": "warn", // Changed from "off" to "warn" for safety
  "vue/no-unused-refs": "off",
  "antfu/top-level-function": "off",
  "node/prefer-global/process": "off",
  "eqeqeq": "warn", // Changed from "off" to "warn" for safety
  "style/no-tabs": "off",
  "no-console": "warn", // Changed from "off" to "warn" for safety
  "no-debugger": "warn", // Changed from "off" to "warn" for safety
  "no-async-promise-executor": "off",
  "style/arrow-parens": "off",
});
