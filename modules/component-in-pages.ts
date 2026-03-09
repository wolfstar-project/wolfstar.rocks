import { join } from "node:path";
import { addComponentsDir, defineNuxtModule } from "nuxt/kit";

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
	setup(_, nuxt) {
		const pagesDir = join(nuxt.options.srcDir, nuxt.options.dir.pages ?? "pages");

		// Register co-located Vue components from the pages directory.
		// Supported conventions:
		//   @components/ subdirectory  →  pages/guilds/@components/GuildCard.vue
		//   .client.vue suffix         →  pages/guilds/Sidebar.client.vue
		//   .server.vue suffix         →  pages/guilds/HeavyList.server.vue
		//
		// Using explicit glob patterns avoids extendComponent filtering, which
		// returns void for non-matching files and does NOT exclude them.

		// All files inside any @components/ folder nested in pages
		addComponentsDir({
			path: pagesDir,
			pattern: [
				"**/@components/**/*.vue",
				"**/@components/**/*.client.vue",
				"**/@components/**/*.server.vue",
			],
			pathPrefix: false,
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
