import type { BuildInfo, EnvType } from "../shared/types";
import { createResolver, defineNuxtModule } from "nuxt/kit";
import { isCI } from "std-env";
import { getEnv, getFileLastUpdated } from "../config/env";

const { resolve } = createResolver(import.meta.url);
/**
 * This module provides build-time environment information and serves different public assets based on the environment.
 * based on: https://github.com/npmx-dev/npmx.dev/blob/main/modules/build-env.ts
 */

export default defineNuxtModule({
	meta: {
		name: "wolfstar:build-env",
	},
	async setup(_options, nuxt) {
		let env: EnvType = "dev";
		nuxt.options.appConfig = nuxt.options.appConfig || {};
		nuxt.options.appConfig.env = env;
		if (import.meta.test) {
			const time = new Date();
			nuxt.options.appConfig.buildInfo = {
				env,
				version: "0.0.0",
				commit: "704987bba88909f3782d792c224bde989569acb9",
				shortCommit: "704987b",
				branch: "xxx",
				time: time.getTime(),
				privacyPolicyDate: time.toISOString(),
				termsDate: time.toISOString(),
				prNumber: null,
			} satisfies BuildInfo;
		} else {
			const [
				{ env: useEnv, version, commit, shortCommit, branch, prNumber },
				privacyPolicyDate,
				termsDate,
			] = await Promise.all([
				getEnv(nuxt.options.dev),
				getFileLastUpdated("app/pages/(marketing)/privacy.vue"),
				getFileLastUpdated("app/pages/(marketing)/terms.vue"),
			]);
			env = useEnv;
			nuxt.options.appConfig.env = useEnv;
			nuxt.options.appConfig.buildInfo = {
				version,
				time: +Date.now(),
				commit,
				shortCommit,
				branch,
				env,
				privacyPolicyDate,
				termsDate,
				prNumber,
			} satisfies BuildInfo as BuildInfo;
		}

		nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || [];
		if (env === "dev")
			nuxt.options.nitro.publicAssets.unshift({ dir: resolve("../public-dev") });
		else if (env === "canary" || env === "preview" || !isCI)
			nuxt.options.nitro.publicAssets.unshift({ dir: resolve("../public-staging") });
	},
});

declare module "@nuxt/schema" {
	interface AppConfig {
		env: BuildInfo["env"];
		buildInfo: BuildInfo;
	}
}
