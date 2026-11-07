import {
	compileAutomodWords,
	findAutomodWordMatches,
} from "../../shared/utils/automod-word-pattern";
import { findCoveredAutomodWords } from "../utils/automod-words";

// Runs the expression of a rule away from the page, as the bot runs it in a worker: a word such as `aaaaaaaab` can take
// seconds on a long message, and the page ends this worker when it does, instead of freezing.

export type AutomodWordPreviewRequest =
	| { id: number; kind: "matches"; words: string[]; text: string }
	| { id: number; kind: "covered"; words: string[] };

// The global scope of a worker, which the DOM types do not describe.
const scope = globalThis as unknown as {
	addEventListener(
		type: "message",
		listener: (event: MessageEvent<AutomodWordPreviewRequest>) => void,
	): void;
	postMessage(message: unknown): void;
};

/** What the worker answers to a request. */
export function answerAutomodWordRequest(request: AutomodWordPreviewRequest) {
	if (request.kind === "covered") {
		return { id: request.id, covered: [...findCoveredAutomodWords(request.words)] };
	}
	const expression = compileAutomodWords(request.words);
	const matches = expression === null ? [] : findAutomodWordMatches(expression, request.text);
	return { id: request.id, matches };
}

scope.addEventListener("message", (event) =>
	scope.postMessage(answerAutomodWordRequest(event.data)),
);
