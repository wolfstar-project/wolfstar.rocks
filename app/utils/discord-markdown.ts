/**
 * The part of Discord's message markdown the commands demo replies use: lines,
 * `## ` headings, `- ` list items and `-# ` subtext, with `**bold**`,
 * `` `code` `` and mentions inside them. A mention is written `<@name>` for a
 * user or a role and `<#name>` for a channel, so a bare `@` or `#` in a
 * translation stays text.
 */
export type DiscordInline =
	| { type: "text"; content: string }
	| { type: "bold"; content: string }
	| { type: "code"; content: string }
	| { type: "mention"; kind: "user" | "channel"; name: string };

export type DiscordBlockType = "line" | "heading" | "bullet" | "subtext";

export interface DiscordBlock {
	type: DiscordBlockType;
	inline: DiscordInline[];
}

const BLOCK_PREFIXES: readonly (readonly [string, DiscordBlockType])[] = [
	["## ", "heading"],
	["-# ", "subtext"],
	["- ", "bullet"],
];

const INLINE_PATTERN = /\*\*(.+?)\*\*|`([^`]+)`|<@([^>]+)>|<#([^>]+)>/g;

export function parseDiscordInline(source: string): DiscordInline[] {
	const parts: DiscordInline[] = [];
	let last = 0;
	for (const match of source.matchAll(INLINE_PATTERN)) {
		if (match.index > last) {
			parts.push({ type: "text", content: source.slice(last, match.index) });
		}
		const [, bold, code, user, channel] = match;
		if (bold !== undefined) parts.push({ type: "bold", content: bold });
		else if (code !== undefined) parts.push({ type: "code", content: code });
		else if (user !== undefined) parts.push({ type: "mention", kind: "user", name: user });
		else if (channel !== undefined) {
			parts.push({ type: "mention", kind: "channel", name: channel });
		}
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
