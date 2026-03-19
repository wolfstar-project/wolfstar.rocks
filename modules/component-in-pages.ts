import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { addComponent, addVitePlugin, defineNuxtModule } from "nuxt/kit";

const CLIENT_WRAPPER_PREFIX = "\0virtual:client-wrapper:";

/**
 * Map of virtual module IDs → wrapper code snippets. Populated during
 * the `components:extend` hook and served by the companion Vite plugin.
 */
const clientWrapperModules = new Map<string, string>();

function* walkAtComponents(dir: string, inComponents = false): Generator<string> {
	if (!existsSync(dir)) return;
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* walkAtComponents(full, inComponents || entry.name === "@components");
		} else if (inComponents && entry.name.endsWith(".vue")) {
			yield full;
		}
	}
}

function toComponentName(filePath: string): string {
	return basename(filePath)
		.replace(/\.client\.vue$/, "")
		.replace(/\.server\.vue$/, "")
		.replace(/\.vue$/, "");
}

function toComponentMode(filePath: string): "client" | "server" | "all" {
	const name = basename(filePath);
	if (name.endsWith(".client.vue")) return "client";
	if (name.endsWith(".server.vue")) return "server";
	return "all";
}

function isColocatedComponent(filePath: string | undefined): boolean {
	if (!filePath) return false;
	const name = filePath.split("/").pop() ?? "";
	return (
		filePath.includes("/@components/") ||
		name.endsWith(".client.vue") ||
		name.endsWith(".server.vue")
	);
}

export default defineNuxtModule({
	meta: {
		name: "component-in-pages",
	},
	async setup(_, nuxt) {
		const pagesDir = join(nuxt.options.srcDir, nuxt.options.dir.pages ?? "pages");

		// Register each co-located component individually so Nuxt has a precise,
		// duplicate-free registration with an explicit name and mode. Using
		// addComponent instead of addComponentsDir avoids the glob-scanner producing
		// multiple entries for the same .client.vue / .server.vue file, which can
		// cause `Cannot access '__nuxt_component_N_client' before initialization`.
		for (const filePath of walkAtComponents(pagesDir)) {
			// eslint-disable-next-line no-await-in-loop
			await addComponent({
				filePath,
				mode: toComponentMode(filePath),
				name: toComponentName(filePath),
			});
		}

		// Fix TDZ (Temporal Dead Zone) errors for ALL .client.vue components.
		//
		// Without this hook Nuxt generates eager module-scope code:
		//   import { default as __nuxt_component_N_client } from 'Component.client.vue'
		//   const __nuxt_component_N_client_wrapped = createClientOnly(__nuxt_component_N_client)
		//
		// In Vite SSR dev mode the import binding can be uninitialized when
		// createClientOnly() runs (circular-dep induced TDZ), causing:
		//   "Cannot access '__nuxt_component_N_client' before initialization"
		//
		// The fix: redirect every .client.vue component through a virtual wrapper
		// module that uses defineAsyncComponent, so the real import is deferred
		// inside a factory function and TDZ becomes impossible.
		addVitePlugin({
			name: "nuxt:client-vue-wrapper",
			resolveId(id) {
				if (id.startsWith(CLIENT_WRAPPER_PREFIX)) return id;
			},
			load(id) {
				if (id.startsWith(CLIENT_WRAPPER_PREFIX)) {
					return clientWrapperModules.get(id);
				}
			},
		});

		nuxt.hook("components:extend", (components) => {
			for (const component of components) {
				// Only fix actual .client.vue files — skip Nuxt internal client
				// components (NuxtRouteAnnouncer, etc.) that don't use the suffix.
				if (component.mode !== "client" || !component.filePath.endsWith(".client.vue")) {
					continue;
				}

				const originalPath = component.filePath;
				const originalExport = component.export || "default";
				const virtualId = `${CLIENT_WRAPPER_PREFIX}${component.pascalName}`;

				clientWrapperModules.set(
					virtualId,
					[
						'import { createClientOnly } from "#app/components/client-only"',
						'import { defineAsyncComponent } from "vue"',
						`export default createClientOnly(defineAsyncComponent(() => import(${JSON.stringify(originalPath)}).then(r => r.${originalExport} || r)))`,
					].join("\n"),
				);

				component.filePath = virtualId;
				component.mode = "all";
				component._raw = true;
				component.export = "default";
			}
		});

		nuxt.hook("pages:extend", (pages) => {
			// Step 1: Remove co-located component files from the router so they
			// don't become page routes.
			const filtered = pages.filter((route) => !isColocatedComponent(route.file));

			// Step 2: Identify layout routes and regular routes
			const layouts = [] as typeof pages;
			const regularRoutes = [] as typeof pages;

			filtered.forEach((route) => {
				if (route.file?.includes("/@layout")) {
					layouts.push(route);
				} else {
					regularRoutes.push(route);
				}
			});

			// Step 3: Transform layouts and build the hierarchy
			const result = [] as typeof pages;
			const processedRoutes = new Set();

			layouts.forEach((layout) => {
				// Rewrite the path: remove /@layout
				const layoutPath = layout.path.replace("/@layout", "");
				const layoutDir = layout.file?.substring(0, layout.file?.lastIndexOf("/") ?? 0);

				// Find children: routes whose file path starts with the layout's directory
				const children = regularRoutes.filter(
					(route) =>
						route.file?.startsWith(`${layoutDir}/`) && route.file !== layout.file,
				);

				// Mark children as processed
				children.forEach((child) => processedRoutes.add(child));

				// Add the layout with its children
				result.push({
					...layout,
					children: children.map((child) => Object.assign({}, child)),
					path: layoutPath,
				});
			});

			// Step 4: Add remaining routes that weren't nested under a layout
			regularRoutes.forEach((route) => {
				if (!processedRoutes.has(route)) {
					result.push({ ...route });
				}
			});

			// Step 5: Clear the original array and add back only the filtered pages
			pages.length = 0;
			pages.push(...result);
		});
	},
});
