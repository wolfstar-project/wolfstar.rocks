import {
	AutoModerationRuleWordLength,
	MaximumAutoModerationRuleListLength,
} from "#shared/utils/automod-rules";
import {
	compileAutomodWords,
	findAutomodWordMatches,
	type AutomodWordMatch,
	kPatternGroupReplacer,
	kWordBoundaryWildcard,
	processWordBoundaries,
	WordBoundary,
} from "#shared/utils/automod-word-pattern";
import { remove as removeConfusables } from "confusables";

/**
 * Where a word must sit in a message for the rule to act, the wildcards a word is saved with.
 *
 * - `whole`: on its own, between characters that are not letters, digits or `_` (`word`).
 * - `continues`: it can go on after (`word*`).
 * - `prefixed`: it can have letters before (`*word`).
 * - `anywhere`: anywhere, even inside another word (`*word*`).
 */
export type AutomodWordMode = "whole" | "continues" | "prefixed" | "anywhere";

export const AUTOMOD_WORD_MODES = ["whole", "continues", "prefixed", "anywhere"] as const;

/**
 * A word as the simple form shows it: its letters, where it must sit, and the other characters a letter can be written
 * with, by the position of the letter.
 */
export interface AutomodWordDraft {
	mode: AutomodWordMode;
	letters: string;
	alternatives: Record<number, string>;
}

/**
 * A word as a `Words` rule stores it: lowercase and without look-alike characters, as the server saves it.
 */
function normalizeAutomodWord(word: string) {
	return removeConfusables(word.trim().toLowerCase());
}

const MODE_BY_BOUNDARY: Record<WordBoundary, AutomodWordMode> = {
	[WordBoundary.None]: "whole",
	[WordBoundary.End]: "continues",
	[WordBoundary.Start]: "prefixed",
	[WordBoundary.Both]: "anywhere",
};

/** The word without the wildcards that say where it sits. */
function automodWordCore(word: string) {
	switch (processWordBoundaries(word)) {
		case WordBoundary.None:
			return word;
		case WordBoundary.Start:
			return word.slice(1);
		case WordBoundary.End:
			return word.slice(0, -1);
		case WordBoundary.Both:
			return word.slice(1, -1);
	}
}

export function automodWordMode(word: string): AutomodWordMode {
	return MODE_BY_BOUNDARY[processWordBoundaries(word)];
}

function withAutomodWordMode(core: string, mode: AutomodWordMode) {
	const start = mode === "prefixed" || mode === "anywhere" ? kWordBoundaryWildcard : "";
	const end = mode === "continues" || mode === "anywhere" ? kWordBoundaryWildcard : "";
	return `${start}${core}${end}`;
}

/**
 * The characters of a group, without repeats. A `-` goes last, where it cannot read as a range between two others.
 */
function groupOf(letter: string, alternatives: string) {
	const characters = [...new Set([...letter, ...alternatives])].filter(
		(character) => character !== "[" && character !== "]" && character.trim() !== "",
	);
	const dash = characters.includes("-");
	return `${characters.filter((character) => character !== "-").join("")}${dash ? "-" : ""}`;
}

/**
 * The word the simple form saves.
 */
export function composeAutomodWord(draft: AutomodWordDraft) {
	const core = Array.from(draft.letters, (letter, index) => {
		const alternatives = draft.alternatives[index] ?? "";
		const group = groupOf(letter, alternatives);
		return group.length > 1 ? `[${group}]` : letter;
	}).join("");
	return withAutomodWordMode(core, draft.mode);
}

/**
 * Reads a saved word back into the simple form, `null` when the form cannot show it: a range such as `[a-z]`, or a
 * bracket outside a group. Those are edited as written.
 */
export function parseAutomodWord(word: string): AutomodWordDraft | null {
	const core = automodWordCore(word);
	let letters = "";
	const alternatives: Record<number, string> = {};
	let previous = 0;

	for (const match of core.matchAll(new RegExp(kPatternGroupReplacer.source, "g"))) {
		const between = core.slice(previous, match.index);
		if (/[[\]]/.test(between)) return null;
		letters += between;

		const group = match[1] ?? "";
		if (/.-./.test(group)) return null;
		const [letter = "", ...others] = [...group];
		if (others.length > 0) alternatives[[...letters].length] = others.join("");
		letters += letter;
		previous = match.index + match[0].length;
	}

	const rest = core.slice(previous);
	if (/[[\]]/.test(rest)) return null;
	return { mode: automodWordMode(word), letters: letters + rest, alternatives };
}

export type AutomodWordProblem =
	| "empty"
	| "tooShort"
	| "tooLong"
	| "duplicate"
	| "brackets"
	| "listFull";

type AutomodWordNote = "innerWildcard" | "normalized";

export interface AutomodWordCheck {
	/** The word as it is saved. */
	word: string;
	/** Why it cannot be saved, `null` when it can. */
	problem: AutomodWordProblem | null;
	/** What the member should know about it, even though it can be saved. */
	notes: AutomodWordNote[];
}

const GROUP = /\[[^\][]+\]/g;

/**
 * Whether a word can join a list, and what to tell the member about it.
 *
 * @param word - The word as written.
 * @param others - The other words of the list, as saved, without the one being edited.
 */
export function checkAutomodWord(word: string, others: readonly string[]): AutomodWordCheck {
	const normalized = normalizeAutomodWord(word);
	const notes: AutomodWordNote[] = [];
	if (normalized !== word.trim()) notes.push("normalized");

	const core = automodWordCore(normalized);
	if (core.includes(kWordBoundaryWildcard)) notes.push("innerWildcard");

	const { minimum, maximum } = AutoModerationRuleWordLength;
	let problem: AutomodWordProblem | null = null;
	// Two wildcards and nothing between them would match every message.
	if (core.length === 0) problem = "empty";
	else if (normalized.length < minimum) problem = "tooShort";
	else if (normalized.length > maximum) problem = "tooLong";
	else if (/[[\]]/.test(core.replaceAll(GROUP, ""))) problem = "brackets";
	else if (others.includes(normalized)) problem = "duplicate";
	else if (others.length >= MaximumAutoModerationRuleListLength) problem = "listFull";

	return { word: normalized, problem, notes };
}

/**
 * A text the word takes: each group written with its first character.
 */
function automodWordSample(word: string) {
	return automodWordCore(word).replaceAll(GROUP, (group) => group.charAt(1));
}

/**
 * The parts of a message an expression takes, read as the bot reads it: with
 * the look-alike characters replaced first (`removeConfusables()` in its
 * worker), so `bａd` and `b\u200Bad` are caught as `bad` is. The offsets are
 * those of the message as it was written.
 */
export function findAutomodMessageMatches(expression: RegExp, text: string): AutomodWordMatch[] {
	// Each character is replaced on its own, so every unit of the clean text
	// knows the character it came from.
	let clean = "";
	const starts: number[] = [];
	const ends: number[] = [];
	let offset = 0;
	for (const character of text) {
		const replaced = removeConfusables(character);
		for (let unit = 0; unit < replaced.length; unit++) {
			starts.push(offset);
			ends.push(offset + character.length);
		}
		clean += replaced;
		offset += character.length;
	}

	// A sequence the library reads as a whole has no character to point back
	// to: the message is matched as the bot sees it, within its own length.
	const whole = removeConfusables(text);
	if (whole !== clean) {
		return findAutomodWordMatches(expression, whole).map(({ start, end }) => ({
			start: Math.min(start, text.length),
			end: Math.min(end, text.length),
		}));
	}

	return findAutomodWordMatches(expression, clean).map(({ start, end }) => ({
		start: starts[start] ?? text.length,
		end: ends[end - 1] ?? text.length,
	}));
}

export interface AutomodWordExample {
	text: string;
	kind: "plain" | "repeated" | "separated" | "continues" | "prefixed" | "inside";
	matches: boolean;
}

/**
 * Messages that show what a word takes and what it lets through, each checked with the bot's expression.
 */
export function automodWordExamples(word: string): AutomodWordExample[] {
	const expression = compileAutomodWords([word]);
	const sample = automodWordSample(word);
	if (expression === null || sample.length === 0) return [];

	const letters = [...sample];
	const first = letters[0] ?? "";
	const candidates: Omit<AutomodWordExample, "matches">[] = [
		{ text: sample, kind: "plain" },
		{ text: `${first}${first}${letters.slice(1).join("")}`, kind: "repeated" },
		{ text: letters.join("."), kind: "separated" },
		{ text: `${sample}xyz`, kind: "continues" },
		{ text: `xyz${sample}`, kind: "prefixed" },
		{ text: `xyz${sample}xyz`, kind: "inside" },
	];

	return candidates
		.filter((candidate) => candidate.kind !== "separated" || letters.length > 1)
		.map(({ text, kind }) => ({
			text,
			kind,
			matches: findAutomodMessageMatches(expression, text).length > 0,
		}));
}

/** The characters a group takes, a range by its two ends. */
function groupCharacters(group: string) {
	const characters = new Set<string>();
	const rest = group.replaceAll(/(.)-(.)/g, (_, from: string, to: string) => {
		characters.add(from);
		characters.add(to);
		return "";
	});
	for (const character of rest) characters.add(character);
	return [...characters];
}

/**
 * The texts a word is written for: its first characters, then each other character of each group in turn, so a word
 * is only reported as covered when the other one takes all of them.
 */
function samplesOf(word: string): string[] {
	const core = automodWordCore(word);
	const base = automodWordSample(word);
	const samples = new Set([base]);
	for (const match of core.matchAll(GROUP)) {
		for (const character of groupCharacters(match[0].slice(1, -1))) {
			const before = core.slice(0, match.index).replaceAll(GROUP, (group) => group.charAt(1));
			const after = core
				.slice(match.index + match[0].length)
				.replaceAll(GROUP, (group) => group.charAt(1));
			samples.add(`${before}${character}${after}`);
		}
	}
	return [...samples];
}

function contextsOf(word: string) {
	const samples = samplesOf(word);
	switch (automodWordMode(word)) {
		case "whole":
			return samples;
		case "continues":
			return samples.flatMap((sample) => [sample, `${sample}zq`]);
		case "prefixed":
			return samples.flatMap((sample) => [sample, `zq${sample}`]);
		case "anywhere":
			return samples.flatMap((sample) => [sample, `zq${sample}zq`]);
	}
}

/**
 * For each word of a list, another word of the list that already takes what it takes, found by trying the other words
 * on the messages the word is written for, with each character of its groups. It is a guide, not a proof: a range is tried by its two ends.
 */
export function findCoveredAutomodWords(words: readonly string[]): Map<string, string> {
	const expressions = words.map((word) => [word, compileAutomodWords([word])] as const);
	const covered = new Map<string, string>();

	for (const word of words) {
		const contexts = contextsOf(word);
		for (const [other, expression] of expressions) {
			if (other === word || expression === null) continue;
			const takesAll = contexts.every(
				(context) => findAutomodWordMatches(expression, context).length > 0,
			);
			if (takesAll) {
				covered.set(word, other);
				break;
			}
		}
	}

	return covered;
}

/**
 * Reads a list written one word per line, as the export writes it.
 *
 * @returns The words that can be added, and the lines that cannot, with why.
 */
export function importAutomodWords(text: string, current: readonly string[]) {
	const added: string[] = [];
	const rejected: { line: string; problem: AutomodWordProblem }[] = [];

	for (const line of text.split(/\r?\n/)) {
		if (line.trim().length === 0) continue;
		const check = checkAutomodWord(line, [...current, ...added]);
		if (check.problem === null) added.push(check.word);
		else rejected.push({ line: line.trim(), problem: check.problem });
	}

	return { added, rejected };
}

export function exportAutomodWords(words: readonly string[]) {
	return `${words.join("\n")}\n`;
}

export type AutomodWordLettersProblem = "edgeWildcard" | "brackets";

/**
 * Why the letters typed in the simple form cannot be read as they look: a `*` at an edge would change where the word
 * sits, and a bracket would start a group. The form has its own choices for both.
 */
export function checkAutomodWordLetters(letters: string): AutomodWordLettersProblem | null {
	const trimmed = letters.trim();
	if (trimmed.startsWith(kWordBoundaryWildcard) || trimmed.endsWith(kWordBoundaryWildcard)) {
		return "edgeWildcard";
	}
	return /[[\]]/.test(trimmed) ? "brackets" : null;
}
