/* oxlint-disable no-console */
/**
 * Draws the cover of a blog post from its frontmatter, in the site's own look.
 *
 * Usage: pnpm blog:cover <slug> [--force]
 *
 * Reads `title`, `description` and `category` from `content/blog/<slug>.md` and
 * writes `public/assets/blog/<slug>.jpg`. The picture is both the card on
 * `/blog` and the preview a link to the post gets, so it carries the title.
 * `docs/blog.md` says when to draw a cover by hand instead.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import { Renderer } from "@takumi-rs/core";

const ROOT = process.cwd();
/** 1.9:1, the shape link previews use; the 16:9 card on `/blog` crops 3% off each side. */
const WIDTH = 1600;
const HEIGHT = 840;
const JPEG_QUALITY = 92;
const FONT_WEIGHTS = ["Regular", "Medium", "SemiBold", "Bold"];

// The colours are those of the site: the dark theme's canvas, WolfStar's red
// and the primary indigo. A picture cannot read the CSS tokens, so they are
// written out here.
const STYLES = `
.cover {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 100%;
	height: 100%;
	padding: 72px 88px;
	color: #ffffff;
	font-family: Geist;
	background-color: #0a0a0a;
	background-image:
		radial-gradient(circle at 92% 18%, rgba(253, 58, 42, 0.42) 0%, rgba(10, 10, 10, 0) 58%),
		radial-gradient(circle at 4% 100%, rgba(91, 79, 245, 0.3) 0%, rgba(10, 10, 10, 0) 46%);
}
.brand { display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 700; }
.text { display: flex; flex-direction: column; align-items: flex-start; }
.category {
	padding: 8px 20px;
	border-radius: 999px;
	background-color: #5b4ff5;
	font-size: 26px;
	font-weight: 600;
}
.title {
	display: block;
	margin: 28px 0 0;
	overflow: hidden;
	font-weight: 700;
	line-height: 1.05;
	letter-spacing: -0.02em;
	line-clamp: 2;
	text-overflow: ellipsis;
}
.description {
	display: block;
	max-width: 1180px;
	margin: 24px 0 0;
	overflow: hidden;
	color: rgba(255, 255, 255, 0.72);
	font-size: 34px;
	line-height: 1.35;
	line-clamp: 2;
	text-overflow: ellipsis;
}
.site { align-self: flex-end; color: rgba(255, 255, 255, 0.6); font-size: 26px; }
`;

interface Frontmatter {
	title: string;
	description: string;
	category: string;
}

/** The value of a top-level `key: value` line, without the quotes YAML allows around it. */
function readField(frontmatter: string, key: string): string {
	const value = new RegExp(`^${key}:[ \\t]*(.+)$`, "m").exec(frontmatter)?.[1]?.trim() ?? "";
	const quote = value[0];
	if ((quote === '"' || quote === "'") && value.endsWith(quote) && value.length > 1) {
		const inner = value.slice(1, -1);
		return quote === "'" ? inner.replaceAll("''", "'") : inner.replaceAll('\\"', '"');
	}
	return value;
}

function readFrontmatter(file: string): Frontmatter {
	const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, "utf8"))?.[1];
	if (frontmatter === undefined) {
		throw new Error(`${file} has no frontmatter.`);
	}

	const fields = {
		category: readField(frontmatter, "category"),
		description: readField(frontmatter, "description"),
		title: readField(frontmatter, "title"),
	};
	if (!fields.title) {
		throw new Error(`${file} has no title to put on the cover.`);
	}
	return fields;
}

function escapeHtml(text: string): string {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

/** A long title gets smaller letters, so its two lines hold more of it. */
function titleSize(title: string): number {
	if (title.length <= 24) return 104;
	if (title.length <= 44) return 84;
	return 68;
}

function markup({ category, description, title }: Frontmatter): string {
	return `
<div class="cover">
	<div class="brand"><img src="logo" width="56" height="56" /><span>WolfStar</span></div>
	<div class="text">
		${category ? `<span class="category">${escapeHtml(category)}</span>` : ""}
		<h1 class="title" style="font-size: ${titleSize(title)}px">${escapeHtml(title)}</h1>
		${description ? `<p class="description">${escapeHtml(description)}</p>` : ""}
	</div>
	<div class="site">wolfstar.rocks/blog</div>
</div>`;
}

async function main() {
	const { positionals, values } = parseArgs({
		allowPositionals: true,
		options: { force: { default: false, type: "boolean" } },
	});
	const slug = positionals[0];

	if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
		console.error("Usage: pnpm blog:cover <slug> [--force]");
		console.error("<slug> is the name of the post's file, without `.md`: wolfstar-v7-alpha");
		process.exit(1);
	}

	const post = join(ROOT, "content", "blog", `${slug}.md`);
	if (!existsSync(post)) {
		console.error(`No post at content/blog/${slug}.md.`);
		process.exit(1);
	}

	const image = `/assets/blog/${slug}.jpg`;
	const output = join(ROOT, "public", image);
	if (existsSync(output) && !values.force) {
		console.error(`public${image} already exists. Pass --force to draw it again.`);
		process.exit(1);
	}

	const renderer = new Renderer();
	for (const weight of FONT_WEIGHTS) {
		// oxlint-disable-next-line no-await-in-loop -- four small files, registered in order
		await renderer.registerFont(
			readFileSync(join(ROOT, "public", "fonts", `Geist-${weight}.ttf`)),
		);
	}

	const cover = await renderer.render(markup(readFrontmatter(post)), {
		css: [STYLES],
		dithering: "ordered-bayer",
		format: "jpeg",
		height: HEIGHT,
		images: [{ data: readFileSync(join(ROOT, "public", "logo-white.svg")), src: "logo" }],
		quality: JPEG_QUALITY,
		width: WIDTH,
	});
	writeFileSync(output, cover);

	console.log(
		`Wrote public${image} (${WIDTH}×${HEIGHT}, ${Math.round(cover.length / 1024)} KB).`,
	);
	console.log(`The post's frontmatter needs this line:\n\nimage: ${image}\n`);
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
