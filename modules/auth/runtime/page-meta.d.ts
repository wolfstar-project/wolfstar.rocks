import type { AuthMeta } from "./types";

// Named `authz` (not `auth`) to avoid colliding with @onmax/nuxt-better-auth's
// own `PageMeta.auth`/`RouteMeta.auth` augmentation, which has an incompatible
// shape and whose own route-protection system we deliberately don't use.
declare module "#app" {
	interface PageMeta {
		authz?: AuthMeta;
	}
}

declare module "vue-router" {
	interface RouteMeta {
		authz?: AuthMeta;
	}
}
