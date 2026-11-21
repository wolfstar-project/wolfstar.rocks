import type { RobotsValue } from "@nuxtjs/robots";

// The `robots` route-rule augmentation generated in `.nuxt/types/nuxt-robots-nitro.d.ts`
// is referenced only by the app/server type contexts. `nuxt.config.ts` is checked in the
// node context, so mirror the augmentation here with identical member types.
declare module "nitropack/types" {
	interface NitroRouteConfig {
		robots?:
			| RobotsValue
			| {
					indexable: boolean;
					rule: string;
			  };
	}
}

declare module "nitropack" {
	interface NitroRouteConfig {
		robots?:
			| RobotsValue
			| {
					indexable: boolean;
					rule: string;
			  };
	}
}
