import { fileURLToPath } from "node:url";
import { getV8Flags } from "@codspeed/core";
import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { playwright } from "@vitest/browser-playwright";
import { isCI } from "std-env";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	define: {
		"process.test": "true",
	},
	resolve: {
		alias: {
			"#site-config/app/composables": `${rootDir}/test/mocks/site-config.ts`,
		},
	},
	test: {
		coverage: {
			enabled: true,
			exclude: ["**/node_modules/**"],
			provider: "v8",
		},
		execArgv: isCI ? getV8Flags() : undefined,
		projects: [
			{
				plugins: isCI ? [codspeedPlugin()] : [],
				resolve: {
					alias: {
						"~": `${rootDir}/app`,
						"#server": `${rootDir}/server`,
						"#shared": `${rootDir}/shared`,
					},
				},
				test: {
					name: "benchmark",
					include: [],
					benchmark: {
						include: ["**/*.bench.ts"],
					},
				},
			},
			{
				resolve: {
					alias: {
						"~": `${rootDir}/app`,
						"#server": `${rootDir}/server`,
						"#shared": `${rootDir}/shared`,
					},
				},
				test: {
					environment: "node",
					include: ["test/unit/**/*.{test,spec}.ts"],
					name: "unit",
					benchmark: {
						include: [],
					},
				},
			},
			await defineVitestProject({
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
								fonts: { providers: { fontshare: false } },
								modules: [`${rootDir}/test/modules/mock-client-id`],
								vue: {
									runtimeCompiler: true,
								},
								experimental: {
									payloadExtraction: false,
									viteEnvironmentApi: false,
								},
								pwa: {
									pwaAssets: { disabled: true },
								},
								sentry: { enabled: false },
								sitemap: { enabled: false },
								ogImage: { enabled: false },
							},
							rootDir: fileURLToPath(new URL(".", import.meta.url)),
						},
					},
					include: ["test/nuxt/**/*.{test,spec}.ts"],
					name: "nuxt",
					benchmark: {
						include: [],
					},
				},
			}),
		],
	},
});
