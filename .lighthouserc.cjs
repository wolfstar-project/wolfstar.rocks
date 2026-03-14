const fs = require("node:fs");

// Auto-detect Chrome executable path
function findChrome() {
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
			],
			numberOfRuns: 1,
			chromePath: findChrome(),
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
						"categories:performance": ["warn", { minScore: 0.9 }],
						"first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
						"largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
						"cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
						"total-blocking-time": ["warn", { maxNumericValue: 300 }],
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
