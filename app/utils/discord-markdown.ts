import { parseMarkdown, type MarkdownBlock } from "~/components/ui/markdown/markdown-syntax";
/**
 * The part of Discord's message markdown the dashboard shows: lines, `# `,
 * `## ` and `### ` headings, `- ` list items, `> ` quotes and `-# ` subtext,
 * with `**bold**`, `*italic*`, `__underline__`, `~~strike~~`, `` `code` ``,
 * links, server emojis, `<t:…>` timestamps and mentions inside them.
 *
 * A mention is written `<@name>` for a user or a role and `<#name>` for a
 * channel, already resolved to its name, so a bare `@` or `#` in a translation
 * stays text.
 */
export type DiscordInline =
	| { type: "text"; content: string }
	| { type: DiscordFormat; children: DiscordInline[] }
	| { type: "code"; content: string }
	| { type: "link"; content: string; url: string }
	| { type: "emoji"; name: string; url: string }
	| { type: "time"; at: string; style: DiscordTimeStyle }
	| { type: "mention"; kind: "user" | "channel"; name: string };

/** A span of formatting, which can hold links, mentions and other spans. */
type DiscordFormat = "bold" | "italic" | "underline" | "strike";

/** How a `<t:…>` timestamp reads: Discord's `t`, `T`, `d`, `D`, `f`, `F` or `R`. */
type DiscordTimeStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export type DiscordBlockType =
	| "line"
	| "title"
	| "heading"
	| "subheading"
	| "bullet"
	| "quote"
	| "subtext";

export interface DiscordBlock {
	type: DiscordBlockType;
	inline: DiscordInline[];
}

const BLOCK_PREFIXES: readonly (readonly [string, DiscordBlockType])[] = [
	["# ", "title"],
	["## ", "heading"],
	["### ", "subheading"],
	["-# ", "subtext"],
	["- ", "bullet"],
	["* ", "bullet"],
	["> ", "quote"],
];

const INLINE_PATTERN = new RegExp(
	[
		/\*\*(.+?)\*\*/.source,
		/__(.+?)__/.source,
		/\*([^*\s][^*]*)\*/.source,
		/~~(.+?)~~/.source,
		/`([^`]+)`/.source,
		/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/.source,
		/<?(https?:\/\/[^\s<>]+[^\s<>.,:;"')\]])>?/.source,
		/<(a?):(\w{2,32}):(\d{17,20})>/.source,
		/<t:(-?\d{1,13})(?::([tTdDfFR]))?>/.source,
		/<@([^>]+)>/.source,
		/<#([^>]+)>/.source,
	].join("|"),
	"g",
);

type Match = RegExpMatchArray & { index: number };

function inlineOf(match: Match): DiscordInline {
	const [, bold, underline, italic, strike, code, linkText, linkUrl, bareUrl] = match;
	const [animated, emojiName, emojiId, unix, timeStyle, user, channel] = match.slice(9);
	if (bold !== undefined) return { type: "bold", children: parseDiscordInline(bold) };
	if (underline !== undefined) {
		return { type: "underline", children: parseDiscordInline(underline) };
	}
	if (italic !== undefined) return { type: "italic", children: parseDiscordInline(italic) };
	if (strike !== undefined) return { type: "strike", children: parseDiscordInline(strike) };
	if (code !== undefined) return { type: "code", content: code };
	if (linkText !== undefined && linkUrl !== undefined) {
		return { type: "link", content: linkText, url: linkUrl };
	}
	if (bareUrl !== undefined) return { type: "link", content: bareUrl, url: bareUrl };
	if (emojiName !== undefined && emojiId !== undefined) {
		const extension = animated ? "gif" : "webp";
		return {
			type: "emoji",
			name: emojiName,
			url: `https://cdn.discordapp.com/emojis/${emojiId}.${extension}?size=48`,
		};
	}
	if (unix !== undefined) {
		const at = new Date(Number(unix) * 1000);
		// Past the range of a JavaScript date, Discord leaves the tag as text too.
		if (Number.isNaN(at.getTime())) return { type: "text", content: match[0] };
		return {
			type: "time",
			at: at.toISOString(),
			style: (timeStyle as DiscordTimeStyle | undefined) ?? "f",
		};
	}
	if (user !== undefined) return { type: "mention", kind: "user", name: user };
	return { type: "mention", kind: "channel", name: channel ?? "" };
}

export function parseDiscordInline(source: string): DiscordInline[] {
	const parts: DiscordInline[] = [];
	let last = 0;
	for (const match of source.matchAll(INLINE_PATTERN) as IterableIterator<Match>) {
		if (match.index > last) {
			parts.push({ type: "text", content: source.slice(last, match.index) });
		}
		parts.push(inlineOf(match));
		last = match.index + match[0].length;
	}
	if (last < source.length) parts.push({ type: "text", content: source.slice(last) });
	return parts;
}

export function parseDiscordMarkdown(source: string): DiscordBlock[] {
	return source.split("\n").map((line) => {
		const prefix = BLOCK_PREFIXES.find(([marker]) => line.startsWith(marker));
		return prefix
			? { type: prefix[1], inline: parseDiscordInline(line.slice(prefix[0].length)) }
			: { type: "line", inline: parseDiscordInline(line) };
	});
}

/** What a line of Discord markdown reads as, without its formatting: a list preview. */
export function discordPlainText(source: string): string {
	const firstLine = source.split("\n").find((line) => line.trim().length > 0) ?? "";
	const prefix = BLOCK_PREFIXES.find(([marker]) => firstLine.startsWith(marker));
	const line = prefix ? firstLine.slice(prefix[0].length) : firstLine;
	return discordInlineText(parseDiscordInline(line)).trim();
}

/** What formatted parts read as, without their formatting. */
export function discordInlineText(parts: readonly DiscordInline[]): string {
	return parts
		.map((part) => {
			if (part.type === "mention") return (part.kind === "channel" ? "#" : "@") + part.name;
			if (part.type === "emoji") return `:${part.name}:`;
			if (part.type === "time") return new Date(part.at).toLocaleDateString();
			if ("children" in part) return discordInlineText(part.children);
			return part.content;
		})
		.join("");
}

/** The heading levels a post written in Discord markdown uses, quotes included. */
function headingLevels(blocks: readonly MarkdownBlock[]): number[] {
	return blocks.flatMap((block) => {
		if (block.type === "heading") return [block.level];
		return block.type === "quote" ? headingLevels(block.children) : [];
	});
}

/**
 * What newt/ui's `Markdown` adds to a post's heading levels so that its top
 * heading is a `<h3>`, under the thread's `<h2>`, whatever size it is written
 * in: a post of `##` alone must not skip a level.
 */
export function postHeadingOffset(content: string): number {
	// Trimmed as the thread hands it to `Markdown`: a heading is read at the start of a line only.
	const levels = headingLevels(parseMarkdown(content.trim()));
	return levels.length === 0 ? 2 : 3 - Math.min(...levels);
}

/** A post's mentions, readied for newt/ui's `Markdown`. */
export interface KeyedMentions {
	/** The post, each mention written with a key in place of its name. */
	content: string;
	/** The name of each key. */
	names: ReadonlyMap<string, string>;
}

/**
 * Readies the mentions of a post for newt/ui's `Markdown`. The server writes
 * each mention with the name Discord shows (`<@Jane Doe>`, `<#rules>`), but
 * `Markdown` reads a mention only without spaces, and takes a name made of
 * digits for an ID it does not know. Each name is swapped for a key the
 * renderer accepts, and `names` gives it back through `resolveMention`.
 */
export function keyMentions(content: string): KeyedMentions {
	const names = new Map<string, string>();
	// Code is shown as written, where newt/ui reads no mention: a code block
	// or an inline code span is matched first and kept as it is.
	const keyed = content.replaceAll(
		/(```[\s\S]*?```|`[^`\n]*`)|<([@#])([^<>\n]+)>/g,
		(match, code: string | undefined, kind: string, name: string) => {
			if (code !== undefined) return match;
			const key = `m${names.size}`;
			names.set(key, name);
			return `<${kind}${key}>`;
		},
	);
	return { content: keyed, names };
}

/**
 * A line of nothing but formatting around spaces, as `_ _` or `** **`, which
 * Discord shows as an empty line: posts use it to space their parts. newt/ui
 * would show the marks themselves, so the line is kept, empty. Code, a block
 * or a span over several lines, is matched first and kept as written. So is
 * an escape, so that `\`` opens no code while `\\`` still does.
 */
export function blankEmptyFormatting(content: string): string {
	return content.replaceAll(
		/(\\[\s\S]|```[\s\S]*?```|``(?:[^`]|`[^`])+``|`[^`]+`)|^[^\S\n]*(?:(\*\*|__|~~|\*|_)[^\S\n]+\2[^\S\n]*)+$/gm,
		(match, code: string | undefined) => (code === undefined ? "\u200B" : match),
	);
}
