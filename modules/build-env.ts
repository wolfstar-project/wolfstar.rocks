import type { BuildInfo } from "../shared/types";
import { createResolver, defineNuxtModule } from "nuxt/kit";
import { isCI } from "std-env";
import { getEnv, getFileLastUpdated, version } from "../config/env";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtModule({
	meta: {
		name: "npmx:build-env",
	},
	async setup(_options, nuxt) {
		const [{ env, commit, shortCommit, branch }, privacyPolicyDate, termsDate] = await Promise.all([
			getEnv(nuxt.options.dev),
			getFileLastUpdated("app/pages/(marketing)/privacy.vue"),
			getFileLastUpdated("app/pages/(marketing)/terms.vue"),
		]);

		nuxt.options.appConfig = nuxt.options.appConfig || {};
		nuxt.options.appConfig.env = env;
		nuxt.options.appConfig.buildInfo = {
			branch,
			commit,
			env,
			privacyPolicyDate,
			shortCommit,
			termsDate,
			time: Number(Date.now()),
			version,
		} satisfies BuildInfo;

		nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || [];
		if (env === "dev") {
			nuxt.options.nitro.publicAssets.unshift({ dir: resolve("../public-dev") });
		} else if (env === "canary" || env === "preview" || !isCI) {
			nuxt.options.nitro.publicAssets.unshift({ dir: resolve("../public-staging") });
		}
	},
});

declare module "@nuxt/schema" {
	interface AppConfig {
		env: BuildInfo["env"];
		buildInfo: BuildInfo;
	}
}
