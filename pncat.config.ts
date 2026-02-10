import { defineConfig, mergeCatalogRules } from "pncat";

export default defineConfig({
	catalogRules: mergeCatalogRules([
		{
			name: "vue",
			match: ["vue", "vue-router", "pinia"],
			// Smaller numbers represent higher priority
			priority: 15,
			// Advanced: version-specific rules
			specifierRules: [{ match: ["vue"], specifier: "<3.0.0", suffix: "legacy" }],
		},
	]),
	// Control how version ranges are processed
	specifierOptions: {
		allowPreReleases: true,
		allowWildcards: false,
		skipComplexRanges: true,
	},
});
