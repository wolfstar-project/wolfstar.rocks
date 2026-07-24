import type { StorybookConfig } from "@storybook-vue/nuxt";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const config = {
	stories: [
		// List welcome first in sidebar
		"../app/storybook/welcome.mdx",
		"../app/**/*.@(mdx|stories.@(js|ts))",
	],
	addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-themes"],
	framework: "@storybook-vue/nuxt",
	staticDirs: ["./.public", { from: "../public", to: "/" }],
	features: {
		backgrounds: false,
	},
	async viteFinal(newConfig) {
		newConfig.plugins ??= [];

		// Nuxt's `createClientOnly` HOC (applied to every `.client.vue` component)
		// renders `undefined` and then dereferences `res.children` under the
		// Storybook production build, throwing
		// "Cannot read properties of undefined (reading 'children')" for any
		// client-only component (header auth, PWA prompts, marketing showcases…).
		// Storybook has no SSR, so the HOC is unnecessary here: rewrite it to a
		// passthrough so `.client` components render directly. The early `return`
		// leaves the rest of the function as dead code, so this stays valid if the
		// upstream implementation changes; the regex simply no-ops when unmatched.
		newConfig.plugins.unshift({
			name: "storybook-nuxt-client-only-passthrough",
			enforce: "pre",
			transform(code: string, id: string) {
				if (
					!id.includes("nuxt/dist/app/components/client-only") ||
					!code.includes("createClientOnly")
				) {
					return null;
				}
				const patched = code.replace(
					/export function createClientOnly\((\w+)\)\s*\{/,
					"export function createClientOnly($1) { return $1;",
				);
				return patched === code ? null : patched;
			},
		});

		// Fix: nuxt:components:imports-alias relies on internal Nuxt state that is
		// cleaned up after nuxt.close() in @storybook-vue/nuxt's loadNuxtViteConfig.
		// When that state is gone, `import X from '#components'` is left unresolved
		// and Vite 8 falls through to package-subpath resolution, which fails with
		// "Missing '#components' specifier in 'nuxt' package".
		// This plugin intercepts #components first and serves a virtual module built
		// from the components.d.ts written during the same Nuxt boot.
		// Resolve the Nuxt build dir from Vite's alias map, which can be either a
		// plain-object (Record<string, string>) or Vite's resolved array form
		// (readonly Alias[] where find is string | RegExp). We must handle both
		// without casting to Record<string, string>, which would be unsound for the
		// array form.
		const aliases = newConfig.resolve?.alias;
		const buildDir = (() => {
			if (!aliases) return undefined;
			if (Array.isArray(aliases)) {
				const entry = aliases.find((a) => a.find === "#build");
				return typeof entry?.replacement === "string" ? entry.replacement : undefined;
			}
			const value = (aliases as Record<string, unknown>)["#build"];
			return typeof value === "string" ? value : undefined;
		})();
		newConfig.plugins.unshift({
			name: "storybook-nuxt-components",
			enforce: "pre",
			resolveId(id) {
				if (id === "#components") return "\0virtual:#components";
				return null;
			},
			load(id) {
				if (id !== "\0virtual:#components") return;
				if (!buildDir) {
					throw new Error(
						"[storybook-nuxt-components] Could not resolve the `#build` alias.",
					);
				}
				const dtsPath = resolve(buildDir, "components.d.ts");
				// Wire the generated declaration file into Vite's file-watch graph so
				// that the virtual module is invalidated when Nuxt regenerates it.
				this.addWatchFile(dtsPath);
				const dts = readFileSync(dtsPath, "utf-8");
				const lines: string[] = [];
				// Match only the direct `typeof import("…").default` form.
				// Lazy/island wrappers (LazyComponent<T>, IslandComponent<T>) are
				// excluded intentionally — Storybook only needs the concrete type.
				// The format has been stable across all Nuxt 3 releases.
				const re =
					/^export const (\w+): typeof import\("([^"]+)"\)(?:\.default|\[['"]default['"]\])\s*;?$/gm;
				let match: RegExpExecArray | null;
				// oxlint-disable-next-line no-cond-assign
				while ((match = re.exec(dts)) !== null) {
					const [, name, rel] = match;
					if (!name || !rel) continue;
					// Virtual module IDs (e.g. \0virtual:client-wrapper:*) are not real
					// file paths — resolve() would produce an invalid absolute path.
					// Re-export them verbatim so Nuxt's registered Vite plugin
					// (nuxt:client-vue-wrapper) can resolve and load them at runtime.
					if (rel.startsWith("\0") || rel.includes("virtual:")) {
						lines.push(`export { default as ${name} } from ${JSON.stringify(rel)}`);
						continue;
					}
					const abs = resolve(buildDir, rel).replaceAll("\\", "/");
					lines.push(`export { default as ${name} } from ${JSON.stringify(abs)}`);
				}
				if (lines.length === 0) {
					throw new Error(
						`[storybook-nuxt-components] No component exports were found in ${dtsPath}.`,
					);
				}
				return lines.join("\n");
			},
		});

		// Bridge compatibility between Storybook v10 core and v9 @storybook-vue/nuxt
		// v10 expects module federation globals that v9 doesn't provide
		newConfig.plugins.push({
			name: "storybook-v10-compat",
			transformIndexHtml: {
				order: "pre",
				handler() {
					return [
						{
							tag: "script",
							injectTo: "head-prepend" as const,
							children: [
								"// Minimal shims for Storybook v10 module federation system",
								"// These will be replaced when Storybook runtime loads",
								"window.__STORYBOOK_MODULE_GLOBAL__ = { global: window };",
								"window.__STORYBOOK_MODULE_CLIENT_LOGGER__ = {",
								"  deprecate: console.warn.bind(console, '[deprecated]'),",
								"  once: console.log.bind(console),",
								"  logger: console",
								"};",
								"window.__STORYBOOK_MODULE_CHANNELS__ = {",
								"  Channel: class { on() {} off() {} emit() {} once() {} },",
								"  createBrowserChannel: () => new window.__STORYBOOK_MODULE_CHANNELS__.Channel()",
								"};",
								"// storybook/internal/preview-errors is externalized to this global by the",
								"// v10 builder; the rolldown-vite build references it in the preview before",
								"// the runtime loads. Back it with Error subclasses so constructing any",
								"// preview error does not throw a ReferenceError during story extraction.",
								"window.__STORYBOOK_MODULE_CORE_EVENTS_PREVIEW_ERRORS__ = (function () {",
								"  var cache = {};",
								"  return new Proxy({}, {",
								"    get: function (_target, prop) {",
								"      if (typeof prop !== 'string') return undefined;",
								"      if (!cache[prop]) cache[prop] = class extends Error {};",
								"      return cache[prop];",
								"    }",
								"  });",
								"})();",
							].join("\n"),
						},
					];
				},
			},
		});

		// Replace the built-in vue-docgen plugin with a fault-tolerant version.
		// vue-docgen-api can crash on components that import types from other
		// .vue files (it tries to parse the SFC with @babel/parser as plain TS).
		// This wrapper catches those errors so the build doesn't fail.
		const docgenPlugin = newConfig.plugins?.find(
			(p): p is Extract<typeof p, { name: string }> =>
				!!p &&
				typeof p === "object" &&
				"name" in p &&
				p.name === "storybook:vue-docgen-plugin",
		);

		if (docgenPlugin && "transform" in docgenPlugin) {
			const hook = docgenPlugin.transform;
			// Vite plugin hooks can be a function or an object with a `handler` property
			const originalFn = typeof hook === "function" ? hook : hook?.handler;
			if (originalFn) {
				const wrapped = async function (this: unknown, ...args: unknown[]) {
					try {
						return await originalFn.apply(this, args);
					} catch (err) {
						// oxlint-disable-next-line no-console -- Log and swallow errors to avoid breaking the Storybook build when vue-docgen-api encounters an unparseable component.
						console.warn(
							"[storybook:vue-docgen-plugin] Suppressed docgen error (component docs may be missing):",
							err,
						);
						return undefined;
					}
				};
				if (typeof hook === "function") {
					docgenPlugin.transform = wrapped as typeof hook;
				} else if (hook) {
					hook.handler = wrapped as typeof hook.handler;
				}
			}
		}

		return newConfig;
	},
} satisfies StorybookConfig;

export default config;
