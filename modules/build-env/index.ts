import type { BuildInfo } from "../../shared/types";
import { defineNuxtModule } from "@nuxt/kit";
import { getEnv, version } from "../../config/env";

export default defineNuxtModule({
  meta: {
    name: "wolfstar:build-env",
  },
  async setup(_options, nuxt) {
    const { env, commit, shortCommit, branch } = await getEnv();
    const buildInfo: BuildInfo = {
      version,
      time: Date.now(),
      commit,
      shortCommit,
      branch,
      env,
    };

    nuxt.options.appConfig = nuxt.options.appConfig || {};
    nuxt.options.appConfig.env = env;
    nuxt.options.appConfig.buildInfo = buildInfo;

    if (nuxt.options._prepare) {
      nuxt.options.pwa ||= {};
      nuxt.options.pwa.pwaAssets ||= {};
      nuxt.options.pwa.pwaAssets.disabled = true;
    }

    nuxt.options.nitro.virtual = nuxt.options.nitro.virtual || {};
    nuxt.options.nitro.virtual["#build-info"] = `export const env = ${JSON.stringify(env)}`;

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || [];
  },
});
