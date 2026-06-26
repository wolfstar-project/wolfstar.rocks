const fs = require("node:fs");

// Auto-detect Chrome executable path
function findChrome() {
	// Allow an explicit override (e.g. CI runners or local Playwright Chromium).
	const override = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
	if (override && fs.existsSync(override)) return override;

	const paths = [
		// Linux
		"/usr/bin/google-chrome-stable",
		"/usr/bin/google-chrome",
		"/usr/bin/chromium-browser",
		// macOS
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		// Windows
		"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
		"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
	];

	for (const p of paths) {
		if (fs.existsSync(p)) return p;
	}

	return undefined;
}

const chromePath = findChrome();

module.exports = {
	ci: {
		collect: {
			startServerCommand: "pnpm preview",
			startServerReadyPattern: "Listening",
			url: [
				"http://localhost:3000/",
				"http://localhost:3000/wolfstar",
				"http://localhost:3000/staryl",
				"http://localhost:3000/commands",
				"http://localhost:3000/privacy",
				"http://localhost:3000/terms",
			],
			numberOfRuns: 1,
			chromePath,
			// LHCI launches a separate browser for the puppeteerScript; it needs an
			// explicit executablePath when no system Chrome channel is installed.
			puppeteerLaunchOptions: chromePath ? { executablePath: chromePath } : undefined,
			puppeteerScript: "./lighthouse-setup.cjs",
			settings: {
				onlyCategories: process.env.LH_PERF
					? ["performance"]
					: ["accessibility", "best-practices", "seo"],
				skipAudits: ["valid-source-maps"],
			},
		},
		assert: {
			assertions: process.env.LH_PERF
				? {
						// Target: 100% performance. CLS is enforced (error) because a zero
						// layout shift is reliably achievable; the category score and timing
						// budgets are warnings because lab numbers vary with runner hardware.
						// Promote the score to "error" once the CI runner reliably hits 1.0.
						"categories:performance": ["warn", { minScore: 1.0 }],
						"first-contentful-paint": ["warn", { maxNumericValue: 1800 }],
						"largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
						"cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
						"total-blocking-time": ["warn", { maxNumericValue: 200 }],
					}
				: {
						"categories:accessibility": ["warn", { minScore: 0.95 }],
						"categories:best-practices": ["warn", { minScore: 0.9 }],
						"categories:seo": ["warn", { minScore: 0.9 }],
					},
		},
		upload: {
			target: "temporary-public-storage",
		},
	},
};
