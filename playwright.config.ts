import type { ConfigOptions } from "@nuxt/test-utils/playwright";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:5678";

export default defineConfig<ConfigOptions>({
	forbidOnly: Boolean(process.env.CI),
	fullyParallel: true,
	projects: [
		{
			name: "chromium-headless-shell",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	reporter: "html",
	retries: process.env.CI ? 2 : 0,
	testDir: "./test/e2e",
	timeout: 120_000,
	use: {
		baseURL,
		nuxt: {
			host: baseURL,
			rootDir: fileURLToPath(new URL(".", import.meta.url)),
		},
		trace: "on-first-retry",
	},
	webServer: {
		command: "pnpm start:playwright:webserver",
		reuseExistingServer: false,
		timeout: 60_000,
		url: baseURL,
	},
});
