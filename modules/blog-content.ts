import { relative } from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";
import { frontmatterProblems } from "../config/blog-content.ts";
import { readingMinutes } from "../shared/utils/blog.ts";

const MODULE_NAME = "wolfstar:blog-content";

/**
 * Reads every blog post and changelog entry as Nuxt Content parses it.
 *
 * It reports a frontmatter the pages cannot draw, and a build stops on it.
 * The report is an error in the log and not a thrown one: Nuxt Content would
 * drop the file with a warning and build the site without it, and under
 * `nuxt dev` a throw from the file watcher restarts the whole server.
 *
 * It also stores each post's reading time next to it, so a list of posts shows
 * "4 min read" without loading every body to count its words. Nuxt Content
 * keeps only the fields its collection schema names: `readingTime` is declared
 * in `content.config.ts`.
 */
export default defineNuxtModule({
	meta: {
		name: MODULE_NAME,
	},
	setup(_, nuxt) {
		const logger = useLogger(MODULE_NAME);
		const refused: string[] = [];

		nuxt.hook("content:file:afterParse", ({ collection, content, file }) => {
			const problems = frontmatterProblems(collection.name, content);
			if (problems.length > 0) {
				const path = relative(nuxt.options.rootDir, file.path).replaceAll("\\", "/");
				const message = `${path}: ${problems.join(" ")} See docs/blog.md.`;
				refused.push(message);
				logger.error(message);
			}

			if (collection.name === "blog") {
				content.readingTime = readingMinutes(file.body);
			}
		});

		// Nuxt Content has parsed every file by now: it does so on `modules:done`.
		nuxt.hook("build:before", () => {
			if (nuxt.options.dev || refused.length === 0) return;
			throw new Error(
				`[${MODULE_NAME}] The frontmatter of ${refused.length} content file(s) has to be fixed first:\n${refused.join("\n")}`,
			);
		});
	},
});
