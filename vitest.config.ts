import { fileURLToPath } from "node:url";
import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	define: {
		"process.test": "true",
	},
	plugins: [codspeedPlugin()],
	test: {
		coverage: {
			enabled: true,
			exclude: ["**/node_modules/**"],
			provider: "v8",
		},
		projects: [
			{
				resolve: {
					alias: {
						"#shared": `${rootDir}/shared`,
					},
				},
				test: {
					environment: "node",
					include: ["test/unit/**/*.{test,spec}.ts"],
					name: "unit",
					benchmark: {
						include: ["test/unit/**/*.{bench}.ts"],
					},
				},
			},
			// oxlint-disable-next-line antfu/no-top-level-await
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
								vue: {
									runtimeCompiler: true,
								},
								experimental: {
									payloadExtraction: false,
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
				},
			}),
		],
	},
});
