/**
 * Fails when the Worker's server bundle carries a module that only runs on
 * Node.
 *
 * A Workers build resolves each package through its export conditions. When a
 * package's `node` entry wins over its `default` one, the bundle still builds
 * and `wrangler deploy --dry-run` still passes, since neither starts the
 * Worker. The failure shows only at run time: Nitro v3 bundled the Node entry
 * of `@discordjs/rest`, whose undici client opens a Node TLS socket, and every
 * call to Discord on beta.wolfstar.rocks failed with "The options.ALPNProtocols
 * option is not implemented".
 *
 * The bundle is not minified, so each module keeps the comment that names its
 * source file (`// node_modules/.pnpm/<package>@<version>/...`). The check
 * reads those comments, and refuses to pass on a bundle that has none.
 *
 * Usage: node scripts/check-worker-bundle.ts [server output directory]
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import process from "node:process";

interface NodeOnlyModule {
	pattern: RegExp;
	reason: string;
}

const NODE_ONLY_MODULES: readonly NodeOnlyModule[] = [
	{
		pattern: /\/node_modules\/undici\//,
		reason: "undici opens Node TLS sockets, which workerd does not implement",
	},
	{
		pattern: /\/node_modules\/@discordjs\/rest\/dist\/index\.m?js/,
		reason: "the Node entry of @discordjs/rest sends requests through undici; the Worker needs dist/web.mjs",
	},
];

const MODULE_MARKER = /^\/\/ (node_modules\/\.pnpm\/\S+)$/gm;

export interface BundleFile {
	path: string;
	source: string;
}

export interface ForbiddenModule {
	file: string;
	module: string;
	reason: string;
}

export type WorkerBundleCheck =
	| { _tag: "Clean"; modules: number }
	| { _tag: "Forbidden"; hits: ForbiddenModule[] }
	| { _tag: "NoModuleMarkers" };

export function checkWorkerBundle(files: readonly BundleFile[]): WorkerBundleCheck {
	const hits: ForbiddenModule[] = [];
	const seen = new Set<string>();
	let modules = 0;

	for (const file of files) {
		for (const match of file.source.matchAll(MODULE_MARKER)) {
			const module = match[1];
			if (module === undefined) continue;
			modules++;
			const rule = NODE_ONLY_MODULES.find(({ pattern }) => pattern.test(`/${module}`));
			const key = `${file.path}\0${module}`;
			if (rule && !seen.has(key)) {
				seen.add(key);
				hits.push({ file: file.path, module, reason: rule.reason });
			}
		}
	}

	if (modules === 0) return { _tag: "NoModuleMarkers" };
	if (hits.length > 0) return { _tag: "Forbidden", hits };
	return { _tag: "Clean", modules };
}

async function readBundle(directory: string): Promise<BundleFile[]> {
	const entries = await readdir(directory, { recursive: true, withFileTypes: true });
	const paths = entries
		.filter((entry) => entry.isFile() && /\.m?js$/.test(entry.name))
		.map((entry) => join(entry.parentPath, entry.name));
	return Promise.all(
		paths.map(async (path) => ({
			path: relative(process.cwd(), path),
			source: await readFile(path, "utf8"),
		})),
	);
}

async function main() {
	const directory = resolve(process.argv[2] ?? ".output/server");
	const result = checkWorkerBundle(await readBundle(directory));

	switch (result._tag) {
		case "Clean": {
			console.log(
				`[worker-bundle] ${result.modules} bundled modules, none of them Node-only.`,
			);
			return;
		}
		case "NoModuleMarkers": {
			console.error(
				`[worker-bundle] ${directory} has no module source comments. If the server bundle is minified now, update this check.`,
			);
			process.exitCode = 1;
			return;
		}
		case "Forbidden": {
			console.error(
				"[worker-bundle] The Worker bundle carries modules that only run on Node:",
			);
			for (const hit of result.hits) {
				console.error(`  - ${hit.module} (in ${hit.file}): ${hit.reason}`);
			}
			process.exitCode = 1;
		}
	}
}

if (import.meta.main) {
	await main();
}
