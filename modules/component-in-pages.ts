import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { addComponent, defineNuxtModule } from "nuxt/kit";

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

function toComponentMode(filePath: string): "client" | "server" | undefined {
	const name = basename(filePath);
	if (name.endsWith(".client.vue")) return "client";
	if (name.endsWith(".server.vue")) return "server";
	return undefined;
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
