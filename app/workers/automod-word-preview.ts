import {
	compileAutomodWords,
	findAutomodWordMatches,
} from "../../shared/utils/automod-word-pattern";

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

scope.addEventListener("message", (event) => {
	const request = event.data;
	if (request.kind === "covered") {
		scope.postMessage({ id: request.id, covered: [...findCoveredAutomodWords(request.words)] });
		return;
	}
	const expression = compileAutomodWords(request.words);
	const matches = expression === null ? [] : findAutomodWordMatches(expression, request.text);
	scope.postMessage({ id: request.id, matches });
});
