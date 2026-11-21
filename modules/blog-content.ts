import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";
import {
	AuthorNameError,
	createAuthorResolver,
	type FrontmatterAuthor,
} from "../config/blog-authors.ts";
import { fileProblems, frontmatterProblems } from "../config/blog-content.ts";
import { readingMinutes } from "../shared/utils/blog.ts";

const MODULE_NAME = "wolfstar:blog-content";
const CHECKED_COLLECTIONS = ["blog", "changelog"] as const;

/** Every problem of the posts and changelog entries, one line per file. */
function contentProblems(rootDir: string): string[] {
	const problems: string[] = [];
	for (const collection of CHECKED_COLLECTIONS) {
		const dir = join(rootDir, "content", collection);
		for (const name of readdirSync(dir).filter((file) => file.endsWith(".md"))) {
			const found = fileProblems(collection, readFileSync(join(dir, name), "utf8"));
			if (found.length > 0) {
				problems.push(`content/${collection}/${name}: ${found.join(" ")}`);
			}
		}
	}
	return problems;
}

/**
 * Checks every blog post and changelog entry, and stores each post's reading time.
 *
 * A build reads the files themselves and stops on a frontmatter the pages
 * cannot draw. It does not rely on Nuxt Content's parse hook for that: a file
 * whose content is in Nuxt Content's cache, which a `pnpm dev` session fills,
 * is never parsed again. Under `nuxt dev` the hook reports a file as it is
 * saved, as an error in the log: a throw from the file watcher would restart
 * the whole server.
 *
 * An author with a GitHub `username` gets that account's name, avatar and
 * profile link when the file is parsed (`config/blog-authors.ts`). An author
 * with neither a `name` nor an answer from ungh stops the build.
 *
 * The reading time lets a list of posts show "4 min read" without loading every
 * body to count its words. Nuxt Content keeps only the fields its collection
 * schema names: `readingTime` is declared in `content.config.ts`.
 */
export default defineNuxtModule({
	meta: {
		name: MODULE_NAME,
	},
	setup(_, nuxt) {
		const logger = useLogger(MODULE_NAME);
		const resolveAuthors = createAuthorResolver();
		// Files whose authors have no name to show, which stop a build.
		const unnamed = new Set<string>();

		nuxt.hook("content:file:afterParse", async ({ collection, content, file }) => {
			if (nuxt.options.dev) {
				const problems = frontmatterProblems(collection.name, content);
				if (problems.length > 0) {
					const path = relative(nuxt.options.rootDir, file.path).replaceAll("\\", "/");
					logger.error(`${path}: ${problems.join(" ")} See docs/blog.md.`);
				}
			}

			if (collection.name === "blog") {
				content.readingTime = readingMinutes(file.body);
			}

			if (
				(collection.name === "blog" || collection.name === "changelog") &&
				Array.isArray(content.authors)
			) {
				const path = relative(nuxt.options.rootDir, file.path).replaceAll("\\", "/");
				try {
					content.authors = await resolveAuthors(content.authors as FrontmatterAuthor[]);
					unnamed.delete(path);
				} catch (error) {
					if (!(error instanceof AuthorNameError)) throw error;
					// Nuxt Content then leaves the file out and caches nothing for it.
					unnamed.add(path);
					logger.error(`${path}: ${error.message}`);
					throw error;
				}
			}
		});

		nuxt.hook("build:before", () => {
			if (nuxt.options.dev) return;
			if (unnamed.size > 0) {
				throw new Error(
					`[${MODULE_NAME}] The authors of ${[...unnamed].join(", ")} have no name to show (see docs/blog.md).`,
				);
			}
			const problems = contentProblems(nuxt.options.rootDir);
			if (problems.length === 0) return;
			throw new Error(
				`[${MODULE_NAME}] The frontmatter of ${problems.length} content file(s) has to be fixed first (see docs/blog.md):\n${problems.join("\n")}`,
			);
		});
	},
});
