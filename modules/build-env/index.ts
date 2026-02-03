import type { BuildInfo } from "../../shared/types";
import { createResolver, defineNuxtModule } from "@nuxt/kit";
import { isCI } from "std-env";
import { getEnv, version } from "../../config/env";
import { Env } from "../../shared/types";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtModule({
  meta: {
    name: "wolfstar:build-env",
  },
  async setup(_options, nuxt) {
    const { env, commit, shortCommit, branch } = await getEnv();

    nuxt.options.appConfig = nuxt.options.appConfig || {};
    nuxt.options.appConfig.env = env;
    nuxt.options.appConfig.buildInfo = {
      version,
      time: +Date.now(),
      commit,
      shortCommit,
      branch,
      env,
    } satisfies BuildInfo;

    nuxt.options.nitro.virtual = nuxt.options.nitro.virtual || {};
    nuxt.options.nitro.virtual["#build-info"] = `export const env = ${JSON.stringify(env)}`;

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || [];
    if (env === Env.Dev)
      nuxt.options.nitro.publicAssets.unshift({ dir: resolve("../public-dev") });
    else if (env === Env.Canary || env === Env.Preview || !isCI)
      nuxt.options.nitro.publicAssets.unshift({ dir: resolve("../public-staging") });
  },
});
