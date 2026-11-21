import type { RobotsValue } from "@nuxtjs/robots";
import type { NuxtSecurityRouteRules } from "nuxt-security";

// Route rules are typed by `RouteRuleConfig` from `nitro/types` on Nitro v3.
// nuxt-security still augments only `nitropack/types` (Nitro v2), so its
// `security` key is declared here. The `robots` augmentation generated in
// `.nuxt/types/nuxt-robots-nitro.d.ts` is referenced only by the app/server type
// contexts; `nuxt.config.ts` is checked in the node context, so it is mirrored
// here with identical member types.
declare module "nitro/types" {
	interface RouteRuleConfig {
		robots?:
			| RobotsValue
			| {
					indexable: boolean;
					rule: string;
			  };
		security?: NuxtSecurityRouteRules;
	}
}
