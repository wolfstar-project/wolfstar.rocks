import type { AuthMeta } from "./types";

declare module "#app" {
	interface PageMeta {
		auth?: AuthMeta;
	}
}

declare module "vue-router" {
	interface RouteMeta {
		auth?: AuthMeta;
	}
}
