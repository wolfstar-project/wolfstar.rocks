export default {
	site: "http://localhost:3000",
	urls: ["/", "/wolfstar", "/staryl", "/commands"],
	scanner: {
		samples: 1,
		device: "desktop",
		throttle: false,
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
	},
};
