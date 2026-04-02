import { fileURLToPath } from "node:url";
import { getV8Flags } from "@codspeed/core";
import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { isCI } from "std-env";
import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	run: {
		tasks: {
			lint: {
				command: "vp lint && vp fmt --check",
			},
			knip: {
				command: "knip",
			},
		},
	},
	lint: {
		plugins: ["unicorn", "typescript", "oxc", "vue", "vitest"],
		jsPlugins: ["@e18e/eslint-plugin", "eslint-plugin-regexp"],
		categories: {
			correctness: "error",
			suspicious: "warn",
			perf: "warn",
		},
		rules: {
			"accessor-pairs": [
				"error",
				{
					enforceForClassMembers: true,
					setWithoutGet: true,
				},
			],
			"eqeqeq": "warn",
			"new-cap": [
				"error",
				{
					capIsNew: false,
					newIsCap: true,
					properties: true,
				},
			],
			"oxc/no-map-spread": ["error", { ignoreArgs: true }],
			"e18e/prefer-array-from-map": "error",
			"e18e/prefer-timer-args": "error",
			"e18e/prefer-date-now": "error",
			"e18e/prefer-regex-test": "error",
			"e18e/prefer-array-some": "error",
			"no-cond-assign": ["error", "always"],
			"no-console": "warn",
			"no-debugger": "warn",
			"no-empty": [
				"error",
				{
					allowEmptyCatch: true,
				},
			],
			"no-labels": [
				"error",
				{
					allowLoop: false,
					allowSwitch: false,
				},
			],
			"no-redeclare": [
				"error",
				{
					builtinGlobals: false,
				},
			],
			"no-restricted-globals": [
				"error",
				{
					message: "Use `globalThis` instead.",
					name: "global",
				},
				{
					message: "Use `globalThis` instead.",
					name: "self",
				},
			],
			"no-shadow": "off",
			"no-self-assign": [
				"error",
				{
					props: true,
				},
			],
			"no-unneeded-ternary": [
				"error",
				{
					defaultAssignment: false,
				},
			],
			"no-unused-expressions": [
				"error",
				{
					allowShortCircuit: true,
					allowTaggedTemplates: true,
					allowTernary: true,
				},
			],
			"no-unused-vars": [
				"error",
				{
					args: "none",
					caughtErrors: "none",
					ignoreRestSiblings: true,
					vars: "all",
				},
			],
			"prefer-const": [
				"error",
				{
					destructuring: "all",
					ignoreReadBeforeAssign: true,
				},
			],
			"unicode-bom": ["error", "never"],
			"use-isnan": [
				"error",
				{
					enforceForIndexOf: true,
					enforceForSwitchCase: true,
				},
			],
			"valid-typeof": [
				"error",
				{
					requireStringLiterals: true,
				},
			],
			"yoda": ["error", "never"],
			"unicorn/no-nested-ternary": "off",
			"unicorn/consistent-empty-array-spread": "error",
			"unicorn/error-message": "error",
			"unicorn/escape-case": "error",
			"unicorn/new-for-builtins": "error",
			"unicorn/no-instanceof-builtins": "error",
			"unicorn/no-new-array": "error",
			"unicorn/no-new-buffer": "error",
			"unicorn/number-literal-case": "error",
			"unicorn/prefer-dom-node-text-content": "error",
			"unicorn/prefer-includes": "error",
			"unicorn/prefer-node-protocol": "error",
			"unicorn/prefer-number-properties": "error",
			"unicorn/prefer-string-starts-ends-with": "error",
			"unicorn/prefer-type-error": "error",
			"unicorn/throw-new-error": "error",
			"unicorn/no-await-expression-member": "off",
			"unicorn/prefer-global-this": "off",
			"unicorn/consistent-function-scoping": "off",
			"unicorn/no-null": "off",
			"no-await-in-loop": "off",
			"regexp/confusing-quantifier": "warn",
			"regexp/control-character-escape": "error",
			"regexp/match-any": "error",
			"regexp/negation": "error",
			"regexp/no-contradiction-with-assertion": "error",
			"regexp/no-dupe-characters-character-class": "error",
			"regexp/no-dupe-disjunctions": "error",
			"regexp/no-empty-alternative": "warn",
			"regexp/no-empty-capturing-group": "error",
			"regexp/no-empty-character-class": "error",
			"regexp/no-empty-group": "error",
			"regexp/no-empty-lookarounds-assertion": "error",
			"regexp/no-empty-string-literal": "error",
			"regexp/no-escape-backspace": "error",
			"regexp/no-extra-lookaround-assertions": "error",
			"regexp/no-invalid-regexp": "error",
			"regexp/no-invisible-character": "error",
			"regexp/no-lazy-ends": "warn",
			"regexp/no-legacy-features": "error",
			"regexp/no-misleading-capturing-group": "error",
			"regexp/no-misleading-unicode-character": "error",
			"regexp/no-missing-g-flag": "error",
			"regexp/no-non-standard-flag": "error",
			"regexp/no-obscure-range": "error",
			"regexp/no-optional-assertion": "error",
			"regexp/no-potentially-useless-backreference": "warn",
			"regexp/no-super-linear-backtracking": "error",
			"regexp/no-trivially-nested-assertion": "error",
			"regexp/no-trivially-nested-quantifier": "error",
			"regexp/no-unused-capturing-group": "error",
			"regexp/no-useless-assertions": "error",
			"regexp/no-useless-backreference": "error",
			"regexp/no-useless-character-class": "error",
			"regexp/no-useless-dollar-replacements": "error",
			"regexp/no-useless-escape": "error",
			"regexp/no-useless-flag": "warn",
			"regexp/no-useless-lazy": "error",
			"regexp/no-useless-non-capturing-group": "error",
			"regexp/no-useless-quantifier": "error",
			"regexp/no-useless-range": "error",
			"regexp/no-useless-set-operand": "error",
			"regexp/no-useless-string-literal": "error",
			"regexp/no-useless-two-nums-quantifier": "error",
			"regexp/no-zero-quantifier": "error",
			"regexp/optimal-lookaround-quantifier": "warn",
			"regexp/optimal-quantifier-concatenation": "error",
			"regexp/prefer-character-class": "error",
			"regexp/prefer-d": "error",
			"regexp/prefer-plus-quantifier": "error",
			"regexp/prefer-predefined-assertion": "error",
			"regexp/prefer-question-quantifier": "error",
			"regexp/prefer-range": "error",
			"regexp/prefer-set-operation": "error",
			"regexp/prefer-star-quantifier": "error",
			"regexp/prefer-unicode-codepoint-escapes": "error",
			"regexp/prefer-w": "error",
			"regexp/simplify-set-operations": "error",
			"regexp/sort-flags": "error",
			"regexp/strict": "error",
			"regexp/use-ignore-case": "error",
		},
		ignorePatterns: [
			".output/**",
			".data/**",
			".nuxt/**",
			".nitro/**",
			".cache/**",
			"dist/**",
			"node_modules/**",
			"coverage/**",
			"playwright-report/**",
			"test-results/**",
			"server/database/generated/**/*",
			".github/hooks/**/*",
			".gemini/**/*",
			".agent/**/*",
			".agents/**/*",
			".skilld/**/*",
			".claude/**/*",
		],
		overrides: [
			{
				files: ["scripts/**/*.ts"],
				rules: {
					"no-console": "off",
				},
			},
			{
				files: ["**/*.?([cm])ts", "**/*.?([cm])tsx", "**/*.vue"],
				plugins: ["typescript"],
				rules: {
					"no-undef": "off",
					"no-redeclare": [
						"error",
						{
							builtinGlobals: false,
						},
					],
					"no-unused-vars": "off",
					"no-useless-constructor": "off",
					"no-unused-expressions": [
						"error",
						{
							allowShortCircuit: true,
							allowTaggedTemplates: true,
							allowTernary: true,
						},
					],
					"@typescript-eslint/ban-ts-comment": [
						"error",
						{
							"ts-expect-error": "allow-with-description",
						},
					],
					"@typescript-eslint/consistent-type-definitions": ["error", "interface"],
					"@typescript-eslint/consistent-type-imports": [
						"error",
						{
							disallowTypeAnnotations: false,
							fixStyle: "separate-type-imports",
							prefer: "type-imports",
						},
					],
					"@typescript-eslint/no-dynamic-delete": "off",
					"@typescript-eslint/no-explicit-any": "off",
					"@typescript-eslint/no-extraneous-class": "off",
					"@typescript-eslint/no-import-type-side-effects": "error",
					"@typescript-eslint/no-namespace": "error",
					"@typescript-eslint/no-non-null-assertion": "off",
					"@typescript-eslint/no-require-imports": "error",
					"@typescript-eslint/prefer-as-const": "error",
					"@typescript-eslint/triple-slash-reference": "off",
				},
			},
			{
				files: ["**/test/**/*.?([cm])[jt]s?(x)"],
				plugins: ["vitest", "typescript"],
				rules: {
					"vitest/consistent-test-it": [
						"error",
						{
							fn: "it",
							withinDescribe: "it",
						},
					],
					"vitest/no-identical-title": "error",
					"vitest/no-import-node-test": "error",
					"vitest/prefer-hooks-in-order": "error",
					"vitest/prefer-lowercase-title": "error",
					"no-unused-expressions": "off",
				},
			},
			{
				files: ["**/*.vue"],
				plugins: ["vue", "typescript"],
				rules: {
					"vue/no-arrow-functions-in-watch": "error",
					"vue/no-deprecated-destroyed-lifecycle": "error",
					"vue/no-export-in-script-setup": "error",
					"vue/no-lifecycle-after-await": "error",
					"vue/prefer-import-from-vue": "error",
					"vue/valid-define-emits": "error",
					"vue/valid-define-props": "error",
					"vue/no-multiple-slot-args": "warn",
					"vue/no-required-prop-with-default": "warn",
				},
			},
			{
				files: ["app/components/**/*.vue", "app/pages/**/@components/**/*.vue"],
				rules: {
					// Component filename casing: Allow PascalCase or kebab-case
					// Rationale: Preserves team convention of PascalCase for Vue components
					// - PascalCase (UserProfile.vue) is idiomatic in Vue ecosystem
					// - Visually distinguishes components from utilities
					// - Avoids mass renames that would break git history
					"unicorn/filename-case": [
						"warn",
						{
							cases: {
								kebabCase: true,
								pascalCase: true,
							},
						},
					],
				},
			},
			{
				files: [
					"**/types/**/*.ts",
					"**/types/**/*.d.ts",
					"**/utils/**/*.ts",
					"**/composables/**/*.ts",
					"**/mocks/**/*.ts",
					"server/database/settings/**/*.ts",
					"**/*.test.ts",
					"**/*.spec.ts",
				],
				rules: {
					// TypeScript files: Allow PascalCase, camelCase, or kebab-case
					// Rationale: Multiple naming conventions are idiomatic in different contexts:
					// - PascalCase for type-only files (ConfigurableData.d.ts)
					// - camelCase for class-based modules (AdderManager.ts, SettingsContext.ts)
					// - kebab-case for utility modules (auth-utils.ts, discord-api.ts)
					// Enforcing single style would require mass renames breaking git history
					"unicorn/filename-case": [
						"warn",
						{
							cases: {
								kebabCase: true,
								pascalCase: true,
								camelCase: true,
							},
						},
					],
				},
			},
			{
				files: [
					"**/*.config.?([cm])[jt]s?(x)",
					"**/*.config.*.?([cm])[jt]s?(x)",
					"**/scripts/**/*.?([cm])[jt]s?(x)",
					"app/components/OgImage/**",
				],
				plugins: ["typescript"],
				rules: {
					"no-await-in-loop": "off",
					"no-console": "off",
				},
			},
		],
	},
	fmt: {
		quoteProps: "consistent",
		semi: true,
		tabWidth: 4,
		trailingComma: "all",
		useTabs: true,
		experimentalTailwindcss: {
			stylesheet: "./app/assets/css/main.css",
			functions: ["tv", "cn"],
		},
		experimentalSortPackageJson: true,
		experimentalSortImports: {
			groups: [
				"type-import",
				["type-parent", "type-sibling", "type-index", "type-internal"],
				"value-builtin",
				"value-external",
				"value-internal",
				["value-parent", "value-sibling", "value-index"],
				"side_effect",
				"import",
				"unknown",
			],
			newlinesBetween: false,
			internalPattern: ["@/**", "~/**", "~~/**", "#server/**", "#shared/**"],
		},
		overrides: [
			{
				files: ["*.yml"],
				options: {
					tabWidth: 2,
					useTabs: false,
				},
			},
			{
				files: ["README.md"],
				options: {
					tabWidth: 2,
					useTabs: false,
					printWidth: 80,
					proseWrap: "always",
				},
			},
		],
		ignorePatterns: [
			".nuxt/",
			"dist/",
			"node_modules/",
			"*.config.js",
			".node-version",
			".env",
			".env.*",
			"pnpm-lock.yaml",
			"yarn.lock",
			"package-lock.json",
			"*.log",
			"*.min.js",
			"*.min.css",
			"*.png",
			"*.jpg",
			"*.jpeg",
			"*.gif",
			"*.svg",
			".github/hooks/**/*",
			"coverage/",
			".agents/",
			".agent/",
			".skilld",
			".claude/",
		],
	},
	staged: {
		"*.{js,ts,mjs,cjs,vue}": "vp lint --fix",
		"*.{js,ts,mjs,cjs,vue,json,yml,md,html,css}": "vp fmt",
	},
	test: {
		projects: [
			{
				define: { "process.test": "true" },
				plugins: isCI ? [codspeedPlugin()] : [],
				resolve: {
					alias: {
						"~": `${rootDir}/app`,
						"~~": `${rootDir}`,
						"#server": `${rootDir}/server`,
						"#shared": `${rootDir}/shared`,
					},
				},
				test: {
					name: "benchmark",
					include: [],
					benchmark: { include: ["**/*.bench.ts"] },
					execArgv: isCI ? getV8Flags() : undefined,
				},
			},
			{
				define: { "process.test": "true" },
				resolve: {
					alias: {
						"~": `${rootDir}/app`,
						"~~": `${rootDir}`,
						"#server": `${rootDir}/server`,
						"#shared": `${rootDir}/shared`,
					},
				},
				test: {
					environment: "node",
					include: ["test/unit/**/*.{test,spec}.ts"],
					name: "unit",
					benchmark: { include: [] },
					execArgv: isCI ? getV8Flags() : undefined,
				},
			},
			() =>
				defineVitestProject({
					define: { "process.test": "true" },
					test: {
						browser: {
							enabled: true,
							instances: [{ browser: "chromium", headless: true }],
							provider: playwright(),
						},
						environment: "nuxt",
						environmentOptions: {
							nuxt: {
								overrides: {
									// @ts-expect-error -- @nuxt/fonts config is not in the base NuxtConfig type
									fonts: { providers: { fontshare: false } },
									runtimeConfig: {
										public: {
											clientId: "test-discord-client-id",
										},
										session: {
											password:
												"ci-dummy-session-key-for-prerender-only-not-for-production",
										},
									},
									vue: { runtimeCompiler: true },
									experimental: {
										payloadExtraction: false,
										viteEnvironmentApi: false,
									},
									pwa: { pwaAssets: { disabled: true } },
									sentry: { enabled: false },
									sitemap: { enabled: false },
									ogImage: { enabled: false },
								},
								rootDir: fileURLToPath(new URL(".", import.meta.url)),
							},
						},
						include: ["test/nuxt/**/*.{test,spec}.ts"],
						name: "nuxt",
						benchmark: { include: [] },
					},
				}),
		],
		coverage: {
			enabled: true,
			exclude: ["**/node_modules/**"],
			provider: "v8",
		},
	},
});
