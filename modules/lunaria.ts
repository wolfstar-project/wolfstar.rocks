import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { defineNuxtModule, useNuxt } from "nuxt/kit";
import { isCI, isTest } from "std-env";
import { getEnv } from "../config/env.ts";

/**
 * Serves the Lunaria translation dashboard and status.json from `dist/lunaria/`.
 * Based on: https://github.com/npmx-dev/npmx.dev/blob/main/modules/lunaria.ts
 */
export default defineNuxtModule({
	meta: {
		name: "wolfstar:lunaria",
	},
	setup() {
		const nuxt = useNuxt();

		const lunariaDistPath = join(nuxt.options.rootDir, "dist/lunaria/");

		nuxt.options.nitro.publicAssets ||= [];
		nuxt.options.nitro.publicAssets.push({
			dir: lunariaDistPath,
			baseURL: "/lunaria/",
			maxAge: 60 * 60 * 24, // 1 day
		});

		if (nuxt.options.dev || nuxt.options._prepare || nuxt.options.test || isTest) {
			return;
		}

		if (!isCI || !existsSync(lunariaDistPath)) {
			mkdirSync(lunariaDistPath, { recursive: true });
			nuxt.hook("nitro:build:before", async () => {
				try {
					execSync("node --experimental-transform-types ./lunaria/lunaria.ts", {
						cwd: nuxt.options.rootDir,
						stdio: "inherit",
					});
				} catch (error) {
					// Always throw in local builds.
					// In CI, only throw when building for production/canary release.
					const { env } = await getEnv(!isCI);
					if (env === "dev" || env === "release" || env === "canary") {
						throw error;
					} else {
						console.error(error);
					}
				}
			});
		}
	},
});
