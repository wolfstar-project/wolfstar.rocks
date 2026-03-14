import { defineUnlighthouseConfig } from "unlighthouse/config";

export default defineUnlighthouseConfig(() => {
	const isCI = !!process.env.CI;
	const colorScheme = process.env.COLOR_SCHEME ?? "light";

	return {
		site: "http://localhost:3000",
		urls: ["/", "/wolfstar", "/staryl", "/commands"],
		scanner: {
			samples: isCI ? 3 : 1,
			device: "desktop",
			throttle: isCI,
		},
		ci: {
			budget: {
				"performance": 90,
				"accessibility": 95,
				"best-practices": 90,
				"seo": 90,
			},
			buildStatic: true,
			reporter: "jsonExpanded",
		},
		lighthouse: {
			skipAudits: ["valid-source-maps"],
			settings: {
				emulatedUserAgent: false,
				screenEmulation: { disabled: true },
			},
		},
		puppeteerClusterOptions: {
			puppeteerOptions: {
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			},
		},
		hooks: {
			"puppeteer:before-goto": async (page) => {
				await page.emulateMediaFeatures([
					{ name: "prefers-color-scheme", value: colorScheme },
				]);
			},
		},
	};
});
