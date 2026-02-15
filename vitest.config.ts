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
					include: ["test/unit/**/*.{test,spec,bench}.ts"],
					name: "unit",
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
						setupFiles: ["./test/nuxt/setup.ts"],
					},
					include: ["test/nuxt/**/*.{test,spec,bench}.ts"],
					name: "nuxt",
				},
			}),
		],
	},
});
