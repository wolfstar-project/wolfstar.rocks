import { fileURLToPath } from "node:url";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	define: {
		"process.test": "true",
	},
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
						"#server": `${rootDir}/server`,
						"#shared": `${rootDir}/shared`,
					},
				},
				test: {
					environment: "node",
					globals: true,
					include: ["test/unit/**/*.{test,spec}.ts"],
					name: "unit",
					setupFiles: ["./test/setup.ts"],
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
								ogImage: { enabled: false },
								pwa: {
									pwaAssets: { disabled: true },
								},
								sentry: { enabled: false },

								sitemap: { enabled: false },
							},
							rootDir: fileURLToPath(new URL(".", import.meta.url)),
						},
						setupFiles: ["./test/setup.ts"],
					},
					globals: true,
					include: ["test/nuxt/**/*.{test,spec}.ts"],
					name: "nuxt",
				},
			}),
		],
	},
});
