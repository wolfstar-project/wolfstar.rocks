import { ofetch } from "ofetch";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** What Cloudflare answers a check of a Turnstile token with. */
interface SiteverifyResponse {
	"success"?: boolean;
	"error-codes"?: readonly string[];
}

type SiteverifyFetcher = (
	url: string,
	options: { method: "POST"; body: Record<string, string> },
) => Promise<SiteverifyResponse>;

/** How a check of a Turnstile token went. */
export type TurnstileVerification =
	| { ok: true }
	/** The token is missing, or Cloudflare refused it (expired, used, forged). */
	| { ok: false; reason: "missing" | "refused"; errorCodes: readonly string[] }
	/** Cloudflare could not be asked. */
	| { ok: false; reason: "unreachable"; errorCodes: readonly string[] };

/** How long `siteverify` has to answer, in milliseconds. */
const SITEVERIFY_TIMEOUT = 5000;

/**
 * Checks a Turnstile token with Cloudflare's `siteverify`, with the site's
 * secret. The member's IP is not sent: the checkpoint reads no IP.
 *
 * @param secret The site's Turnstile secret, never logged.
 * @param token The token the widget gave the page.
 */
export async function verifyTurnstileToken(
	secret: string,
	token: string | undefined,
	// A stalled connection fails into `unreachable` rather than holding the check open.
	fetcher: SiteverifyFetcher = (url, options) =>
		ofetch<SiteverifyResponse>(url, { ...options, timeout: SITEVERIFY_TIMEOUT }),
): Promise<TurnstileVerification> {
	if (token === undefined || token.length === 0) {
		return { ok: false, reason: "missing", errorCodes: [] };
	}

	let response: SiteverifyResponse;
	try {
		response = await fetcher(SITEVERIFY_URL, {
			method: "POST",
			body: { secret, response: token },
		});
	} catch {
		return { ok: false, reason: "unreachable", errorCodes: [] };
	}

	return response.success === true
		? { ok: true }
		: { ok: false, reason: "refused", errorCodes: response["error-codes"] ?? [] };
}
