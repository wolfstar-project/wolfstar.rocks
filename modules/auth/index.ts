import type { RouterContext } from "rou3";
import type { AuthMeta } from "./runtime/types";
import { defu } from "defu";
import {
	addImports,
	addPlugin,
	addRouteMiddleware,
	addTemplate,
	createResolver,
	defineNuxtModule,
} from "nuxt/kit";
import { createRouter as _createRouter, addRoute, findAllRoutes } from "rou3";

interface ModuleOptions {
	loginRoute?: string;
	fullAccessRoles?: string[];
	redirectIfNotAllowed?: string | false;
}

const createRouter = <T extends Record<string, any> = Record<string, string>>(
	routes: string[] | Record<string, T>,
): RouterContext<T> => {
	const router = _createRouter<T>();
	if (Array.isArray(routes)) {
		for (const route of routes) {
			addRoute(router, "GET", route, { path: route } as unknown as T);
		}
	} else {
		for (const [route, data] of Object.entries(routes)) {
			addRoute(router, "GET", route, data);
		}
	}
	return router;
};

export default defineNuxtModule<ModuleOptions>({
	defaults: {
		fullAccessRoles: [],
		loginRoute: "/login",
	},
	meta: {
		configKey: "auth",
		name: "auth",
	},
	async setup(options, nuxt) {
		const { resolve } = createResolver(import.meta.url);

		nuxt.options.routeRules = nuxt.options.routeRules || {};
		const router = createRouter(nuxt.options.routeRules);
		const getRules = (url: string) => {
			const rules = defu(
				{},
				...findAllRoutes(router, "GET", url)
					.map((route) => route.data)
					.toReversed(),
			) as Record<string, any>;

			if (rules.auth) {
				rules.auth.loginRoute ??= options.loginRoute;

				if (options.fullAccessRoles?.length) {
					rules.auth.roles ||= [];
					rules.auth.roles = [...rules.auth.roles, ...options.fullAccessRoles];
				}
			}

			return rules;
		};

		addImports([
			{ from: resolve("./runtime/composable"), name: "useAuth" },
			/* { name: "usePermissions", from: resolve("./runtime/composable") }, */
		]);

		addTemplate({
			filename: "auth.config.mjs",
			getContents: () => `export default ${JSON.stringify(options, null, 2)}`,
		});

		nuxt.hook("modules:done", () => {
			addPlugin({ src: resolve("./runtime/plugin/auth") }, { append: true });
			addRouteMiddleware({
				global: true,
				name: "authz",
				path: resolve("./runtime/middleware/authz"),
			});
		});

		nuxt.hook("prepare:types", ({ references }) => {
			references.push({
				path: resolve("./types.d.ts"),
			});
		});

		nuxt.hook("pages:resolved", (pages) => {
			pages.forEach((page) => {
				const rules = getRules(page.path);
				if (rules?.auth) {
					page.meta ||= {};
					page.meta.auth ??= rules.auth;
				}
			});
		});
	},
});

declare module "nitropack/types" {
	interface NitroRouteConfig {
		auth?: AuthMeta;
	}
	interface NitroRouteRules {
		auth?: AuthMeta;
	}
}

declare module "nitropack" {
	interface NitroRouteConfig {
		auth?: AuthMeta;
	}
	interface NitroRouteRules {
		auth?: AuthMeta;
	}
}

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
