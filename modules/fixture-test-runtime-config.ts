import { defineNuxtModule } from "nuxt/kit";

/**
 * Nuxt module that sanitises `nuxt.options.runtimeConfig` during test runs.
 *
 * ## Problem
 * `@nuxt/test-utils` calls `structuredClone(nuxt.options.runtimeConfig)` inside
 * `getVitestConfigFromNuxt()`. Some Nuxt modules (evlog, @nuxtjs/seo's
 * nuxt-site-config) assign their resolved **module options** directly to keys in
 * `runtimeConfig`.  Those options objects are Proxy-reactive objects (produced by
 * Nuxt 4 / c12's environment-aware config merging), and `structuredClone` cannot
 * clone Proxy objects – it throws a `DataCloneError`.
 *
 * ## Fix
 * After all modules have finished setting up (`modules:done` hooks included), the
 * Nuxt `ready` lifecycle hook fires. At that point we iterate over every top-level
 * key of `runtimeConfig`. For each key that would fail `structuredClone`, replace
 * it with a plain JSON-roundtripped copy, which strips any Proxy wrapper while
 * preserving the serialisable data.
 *
 * We use the `ready` hook (not `modules:done`) because some modules – notably
 * `nuxt-site-config` – assign Proxy-wrapped values inside their own `modules:done`
 * listener.  `ready` fires after every `modules:done` handler has completed, so
 * by then all module-injected runtimeConfig values are stable.
 *
 * This only runs when `process.env.VITEST` is set, so it has zero impact on
 * development/production builds.
 *
 * Sanitize runtimeConfig during tests so `structuredClone` (used by @nuxt/test-utils
 * at config.mjs:131) does not throw `DOMException [DataCloneError]`.
 *
 * Nuxt wraps its internal options in Proxies after module loading.  When a loaded
 * module (or the runtimeConfig merger) stores any non-serialisable value such as a
 * Proxy or a function, `structuredClone` throws.  This module detects that case and
 * replaces the runtimeConfig with a clean POJO by round-tripping through JSON (which
 * simply drops non-serialisable keys/values such as functions).
 *
 * It only runs when `nuxt.options.test === true`, therefore it has zero impact on
 * production or development builds.
 */
export default defineNuxtModule({
	meta: {
		name: "fixture-test-runtimeconfig",
	},
	setup(_options, nuxt) {
		if (!process.env.VITEST || !nuxt.options.test) 
return;

		nuxt.hook("ready", () => {
			const rc = nuxt.options.runtimeConfig as Record<string, unknown>;

			for (const key of Object.keys(rc)) {
				try {
					structuredClone(rc[key]);
					// key is already cloneable – nothing to do
				} catch {
					// Replace the Proxy-wrapped value with a plain JSON clone
					try {
						rc[key] = JSON.parse(JSON.stringify(rc[key]));
					} catch {
						// Value is not JSON-serialisable at all; drop it to avoid
						// crashing the full structuredClone that test-utils performs.
						rc[key] = undefined;
					}
				}
			}
		});

		nuxt.hook("modules:done", () => {
			try {
				structuredClone(nuxt.options.runtimeConfig);
			} catch {
				nuxt.options.runtimeConfig = JSON.parse(
					JSON.stringify(nuxt.options.runtimeConfig, (_, value) => {
						if (typeof value === "function") 
return undefined;
						return value;
					}),
				);
			}
		});
	},
});
