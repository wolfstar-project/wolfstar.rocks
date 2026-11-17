import type { BaseIssue, BaseSchema, InferOutput } from "valibot";
import { instrumentServiceCall } from "#server/utils/sentry/metrics";
import { $fetch as ofetch } from "ofetch";
import { safeParse } from "valibot";

/**
 * A service of the WolfStar Project that holds data of its own behind an HTTP
 * API, such as Staryl. The dashboard never reads its database: a module backed
 * by one calls its API server to server, with a secret the two share.
 * `docs/arch/external-modules.md` has the whole pattern.
 */
export interface ExternalService {
	/** Names the service in spans and logs. */
	name: string;
	/** The root of its API, without a trailing slash. Empty when it is not set up. */
	url: string;
	/** Sent as a bearer token. Empty when it is not set up. */
	secret: string;
}

/** Why a call brought no answer the dashboard can use. */
export type ExternalServiceError =
	/** The deployment has no URL or no secret for the service. */
	| { kind: "not-configured" }
	/** No answer, a 5xx, or a 401: the service is down, or the secret is not the one it holds. */
	| { kind: "unreachable"; status: number | null }
	/** The service understood the request and said no, with its own code. */
	| { kind: "refused"; status: number; code: string }
	/** An answer of another shape than the dashboard knows: the two are out of step. */
	| { kind: "invalid-answer"; issues: string[] };

export type ExternalServiceResult<Value> =
	| { ok: true; value: Value }
	| { ok: false; error: ExternalServiceError };

interface ExternalServiceRequest<Schema> {
	/** From the root of the API: `/guilds/<guild>/notifications`. */
	path: string;
	method?: "GET" | "POST" | "PATCH" | "DELETE";
	body?: Record<string, unknown>;
	/** The Discord ID of the member the call is made for. The service logs it and trusts it for nothing. */
	actorId: string;
	/** What the answer has to look like. It is parsed here, once, and trusted from then on. */
	schema: Schema;
	/** Names the call in its span: `notifications.read`. */
	endpoint: string;
}

/** Long enough for a service that asks a third party before it answers, as an add does. */
const REQUEST_TIMEOUT = 20_000;

/**
 * Calls an external service for a member. A refusal, an outage and an answer
 * of the wrong shape all come back as values, so a route decides what each one
 * means to who asked. Nothing is thrown.
 */
export async function callExternalService<
	Schema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
	service: ExternalService,
	request: ExternalServiceRequest<Schema>,
): Promise<ExternalServiceResult<InferOutput<Schema>>> {
	if (!service.url || !service.secret) {
		return { error: { kind: "not-configured" }, ok: false };
	}

	const answer = await instrumentServiceCall(service.name, request.endpoint, () =>
		// ofetch's own `$fetch`: Nitro's is typed for the app's own routes.
		ofetch
			.raw<unknown>(`${service.url}${request.path}`, {
				...(request.body === undefined ? {} : { body: request.body }),
				headers: {
					"Authorization": `Bearer ${service.secret}`,
					"x-actor-id": request.actorId,
				},
				// A refusal is an answer to read, not an exception.
				ignoreResponseError: true,
				method: request.method ?? "GET",
				retry: 0,
				timeout: REQUEST_TIMEOUT,
			})
			.then(
				(response) => ({ body: response._data, status: response.status }),
				// The request never got an answer: a timeout, a refused connection, a DNS failure.
				() => null,
			),
	);

	if (answer === null) return { error: { kind: "unreachable", status: null }, ok: false };

	// A 401 is the dashboard's own fault, a wrong secret, and no member can fix it.
	if (answer.status >= 500 || answer.status === 401) {
		return { error: { kind: "unreachable", status: answer.status }, ok: false };
	}
	if (answer.status >= 400) {
		return {
			error: { kind: "refused", code: readErrorCode(answer.body), status: answer.status },
			ok: false,
		};
	}

	const parsed = safeParse(request.schema, answer.body);
	if (!parsed.success) {
		return {
			error: {
				kind: "invalid-answer",
				issues: parsed.issues.map((issue) => issue.message),
			},
			ok: false,
		};
	}
	return { ok: true, value: parsed.output };
}

/** The services answer an error as `{ "error": "<code>" }`. */
function readErrorCode(body: unknown): string {
	const code = (body as { error?: unknown } | null)?.error;
	return typeof code === "string" ? code : "unknown";
}
