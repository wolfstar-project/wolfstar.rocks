import { bidirectionalReplace } from "./comparators";

// Ported from `projects/shared/src/RegexCreator.ts` in the bot (wolfstar-project/wolfstar, V7), which builds the
// expression a `Words` rule matches messages with. The preview of the dashboard runs this very code, so keep it in step
// with the bot rather than improving it here: a difference would show a match the bot does not make, or hide one.

export const kWordStartBoundary = String.raw`(?<=^|\W)`;
export const kWordEndBoundary = String.raw`(?=$|\W)`;
export const kWordBoundaryWildcard = "*";
// The empty lookaheads read the next character without taking it, to know whether a separator follows.
// oxlint-disable-next-line regexp/no-empty-lookarounds-assertion
export const kWordReplacer = /.(?=(.)?)/g;
export const kRegExpSymbols = /[-/\\^$*+?.()|[\]{}]/;
// A group holds no `[`, so a match that fails stops at the next one.
// oxlint-disable-next-line regexp/no-empty-lookarounds-assertion
export const kPatternGroupReplacer = /\[([^\][]+)\](?=(.)?)/g;
export const kGroupRangeReplacer = /(.)-(.)/g;

export enum WordBoundary {
	None,
	Start,
	End,
	Both,
}

/**
 * The source of the expression the bot builds from the words of a rule, matched with the `gi` flags.
 */
export function create(words: readonly string[]) {
	const noBoundArray: string[] = [];
	const startBoundArray: string[] = [];
	const endBoundArray: string[] = [];
	const bothBoundArray: string[] = [];

	for (const word of words) {
		switch (processWordBoundaries(word)) {
			case WordBoundary.None:
				noBoundArray.push(processWordPatternsWithGroups(word));
				break;
			case WordBoundary.Start:
				startBoundArray.push(processWordPatternsWithGroups(word.slice(1)));
				break;
			case WordBoundary.End:
				endBoundArray.push(processWordPatternsWithGroups(word.slice(0, -1)));
				break;
			case WordBoundary.Both:
				bothBoundArray.push(processWordPatternsWithGroups(word.slice(1, -1)));
				break;
		}
	}

	const patterns: string[] = [];
	if (noBoundArray.length !== 0) {
		patterns.push(`${kWordStartBoundary}(?:${noBoundArray.join("|")})${kWordEndBoundary}`);
	}
	if (startBoundArray.length !== 0) {
		patterns.push(`(?:${startBoundArray.join("|")})${kWordEndBoundary}`);
	}
	if (endBoundArray.length !== 0) {
		patterns.push(`${kWordStartBoundary}(?:${endBoundArray.join("|")})`);
	}
	if (bothBoundArray.length !== 0) patterns.push(`(?:${bothBoundArray.join("|")})`);

	return patterns.join("|");
}

export function processWordBoundaries(word: string) {
	const starts = word.startsWith(kWordBoundaryWildcard);
	const ends = word.endsWith(kWordBoundaryWildcard);
	if (starts) return ends ? WordBoundary.Both : WordBoundary.Start;
	return ends ? WordBoundary.End : WordBoundary.None;
}

export function processWordPatternsWithGroups(word: string) {
	return bidirectionalReplace(kPatternGroupReplacer, word, {
		onMatch: (match) => `${processGroup(match[1] ?? "")}+${match[2] ? "\\W*" : ""}`,
		outMatch: (match, _, next) =>
			`${processWordPattern(match)}${next === word.length ? "" : "\\W*"}`,
	}).join("");
}

export function processGroup(group: string) {
	const output = bidirectionalReplace(kGroupRangeReplacer, group, {
		onMatch: (match) => {
			const [, from = "", to = ""] = match;
			if (from !== to) return `${processLetter(from)}-${processLetter(to)}`;
			return from === "-" ? "\\-" : `${processLetter(from)}\\-`;
		},
		outMatch: (match) => Array.from(match, processLetter).join(""),
	});

	return `[${output.join("")}]`;
}

export function processWordPattern(word: string) {
	return word.replace(
		kWordReplacer,
		(letter, nextWord: string | undefined) =>
			`${processLetter(letter)}+${nextWord ? "\\W*" : ""}`,
	);
}

export function processLetter(letter: string) {
	return kRegExpSymbols.test(letter) ? `\\${letter}` : letter;
}

/** The longest message the preview reads, so a slow expression cannot hold the page. */
export const MaximumAutomodWordPreviewLength = 500;

/** How long the bot lets the expression of a rule run on a message before it gives up, in milliseconds. */
export const AutomodWordMatchTimeout = 500;

/**
 * The expression the bot matches messages with, `null` for no words.
 */
export function compileAutomodWords(words: readonly string[]): RegExp | null {
	if (words.length === 0) return null;
	try {
		return new RegExp(create(words), "gi");
	} catch {
		return null;
	}
}

export interface AutomodWordMatch {
	start: number;
	end: number;
}

/**
 * The parts of a text an expression from {@linkcode compileAutomodWords} takes.
 */
export function findAutomodWordMatches(expression: RegExp, text: string): AutomodWordMatch[] {
	const matches: AutomodWordMatch[] = [];
	const global = new RegExp(expression.source, "gi");
	for (const match of text.matchAll(global)) {
		if (match[0].length === 0) continue;
		matches.push({ start: match.index, end: match.index + match[0].length });
	}
	return matches;
}
