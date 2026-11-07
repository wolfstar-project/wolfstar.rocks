import type { AppealSubmissionAnswers, AppealSubmitError } from "#shared/utils/my-appeals";
import type { H3Event } from "h3";
import { isRowId } from "#server/database/settings/ids";
import { AppealSubmitErrors, BuiltInAppealFormPath } from "#shared/utils/my-appeals";
import { isSnowflake } from "#shared/utils/snowflake";
import { isObject } from "@sapphire/utilities";
import { createError as createH3Error, getRouterParam } from "h3";

/** The most answers an appeal carries: a form has five questions, the rest is noise. */
export const MaximumAppealSubmissionAnswers = 25;

/** The longest text an answer holds, the bot's `MaximumAppealAnswerLength`. */
export const MaximumAppealSubmissionText = 1000;

/**
 * A refusal the member's page can act on. Thrown with h3's `createError`
 * rather than evlog's: its `data` reaches the page in the body, where the page
 * reads the code from.
 */
function appealError(
	statusCode: number,
	statusMessage: string,
	code: AppealSubmitError,
	errors?: string[],
) {
	return createH3Error({
		statusCode,
		statusMessage,
		message: statusMessage,
		data: { code, ...(errors === undefined ? {} : { errors }) },
	});
}

/** The server of the path, which has to be a Discord ID. */
export function readAppealGuildParam(event: H3Event): string {
	const guildId = getRouterParam(event, "guild") ?? "";
	if (!isSnowflake(guildId))
		throw appealError(400, "Invalid server", "invalid", ["guild: Expected an ID."]);
	return guildId;
}

/** The form of the path: the ID of one, or `builtin` for the one of a server that set none up. */
export function readAppealFormParam(event: H3Event): string {
	const formId = getRouterParam(event, "form") ?? "";
	if (formId !== BuiltInAppealFormPath && !isRowId(formId)) {
		throw appealError(400, "Invalid form", "invalid", ["form: Expected an ID or builtin."]);
	}
	return formId;
}

function isAnswer(value: unknown): value is string | string[] {
	if (typeof value === "string") return value.length <= MaximumAppealSubmissionText;
	return (
		Array.isArray(value) &&
		value.length <= MaximumAppealSubmissionAnswers &&
		value.every(
			(item) => typeof item === "string" && item.length <= MaximumAppealSubmissionText,
		)
	);
}

/**
 * Reads what an appeal is sent with: the case, and the answers by question.
 * Only the shape is checked here; the bot checks the answers against the form.
 */
export function parseAppealSubmission(
	input: unknown,
):
	| { data: { caseId: number; answers: AppealSubmissionAnswers }; errors?: undefined }
	| { data?: undefined; errors: string[] } {
	if (!isObject(input)) return { errors: ["Invalid body."] };

	const { caseId, answers } = input as { caseId?: unknown; answers?: unknown };
	const errors: string[] = [];
	if (typeof caseId !== "number" || !Number.isSafeInteger(caseId) || caseId < 1) {
		errors.push("caseId: Expected a positive integer.");
	}
	const entries = isObject(answers) ? Object.entries(answers as Record<string, unknown>) : null;
	if (
		entries === null ||
		entries.length > MaximumAppealSubmissionAnswers ||
		!entries.every(([, value]) => isAnswer(value))
	) {
		errors.push(
			`answers: Expected at most ${MaximumAppealSubmissionAnswers} answers, each a text or a list of texts of at most ${MaximumAppealSubmissionText} characters.`,
		);
	}
	if (errors.length > 0) return { errors };
	return {
		data: {
			caseId: caseId as number,
			answers: Object.fromEntries(entries!) as AppealSubmissionAnswers,
		},
	};
}

/** Answers a request whose body was refused, one message per field. */
export function throwInvalidAppealSubmission(errors: readonly string[]): never {
	throw appealError(400, "Invalid appeal", "invalid", [...errors]);
}

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
	400: "Invalid appeal",
	403: "Appeal refused",
	404: "Nothing to appeal",
	409: "Case already appealed",
};

/** The status and body of an error `$fetch` threw for the bot's API, when it is one. */
function readBotError(error: unknown): { status: number; body: unknown } | null {
	// Not `isObject()`: it takes plain objects only, and what ofetch throws is a
	// `FetchError`, so every refusal of the bot read as the bot being unreachable.
	if (typeof error !== "object" || error === null) return null;
	const { status, data } = error as { status?: unknown; data?: unknown };
	return typeof status === "number" ? { status, body: data } : null;
}

/**
 * Answers with what the bot refused, as it refused it: the same status, and
 * its `{ error }` as the code. An error the bot did not answer with (it could
 * not be reached, or failed) is a 502 `generic`.
 */
export function throwBotRefusal(error: unknown): never {
	const refusal = readBotError(error);
	if (refusal === null || refusal.status >= 500) {
		throw appealError(502, "The bot could not be reached", "generic");
	}

	const code = isObject(refusal.body) ? (refusal.body as { error?: unknown }).error : undefined;
	const known = AppealSubmitErrors.includes(code as AppealSubmitError)
		? (code as AppealSubmitError)
		: "generic";
	// A 404 with no code is the bot not knowing the server:
	const resolved = refusal.status === 404 && known === "generic" ? "notFound" : known;
	throw appealError(
		refusal.status,
		STATUS_MESSAGES[refusal.status] ?? "Appeal refused",
		resolved,
	);
}
