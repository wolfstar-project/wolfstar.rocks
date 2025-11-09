import { defineConfig, mergeCatalogRules } from "pncat";

export default defineConfig({
  catalogRules: mergeCatalogRules([{
    name: "vue",
    match: ["vue", "vue-router", "pinia"],
    // smaller numbers represent higher priority
    priority: 15,
    // Advanced: version-specific rules
    specifierRules: [
      { specifier: "<3.0.0", suffix: "legacy", match: ["vue"] },
    ],
  }]),
  // Control how version ranges are processed
  specifierOptions: {
    skipComplexRanges: true,
    allowPreReleases: true,
    allowWildcards: false,
  },
});
