import type { H3Event } from "h3";
// oxlint-disable jest/valid-expect
import { createError, getHeader } from "h3";
import { expect } from "vitest";

/**
 * Custom header used by tests to simulate an authenticated Discord session.
 * The value is a user-ID string (any non-empty value counts as "logged in").
 *
 * Why a header instead of a real sealed cookie?
 * The actual `requireUserSession` reads a sealed `wolfstar-session` cookie which requires
 * knowing the session password and running the full nuxt-auth-utils flow. Using a dedicated
 * test header keeps contract tests fast and fully offline.
 */
export const TEST_AUTH_HEADER = "x-test-user-id";

/** Guild snowflake used consistently in URL parameters across API test files. */
export const GUILD_ID = "123456789012345678";

/** Snowflake of the bot-owner user (used as ownerId in guild fixtures). */
export const OWNER_USER_ID = "987654321098765432";

/** Snowflake of a regular member (used when a non-owner calls the API). */
export const MEMBER_USER_ID = "111111111111111111";

let _counter = 0;

/**
 * Returns HTTP headers that represent an "authenticated" request to a test endpoint.
 *
 * A fresh numeric suffix is appended on every call so that each test uses a unique
 * identifier. This prevents rate-limit state that accumulates in the Nitro storage
 * (keyed by user ID) from bleeding across tests.
 *
 * @param userId - Override the generated ID to repeat a specific identity.
 */
export function authHeaders(userId?: string): Record<string, string> {
	const id = userId ?? `mock-user-${++_counter}`;
	return { [TEST_AUTH_HEADER]: id };
}

/**
 * Guard for use inside `registerEndpoint` handlers.
 *
 * Checks for the {@link TEST_AUTH_HEADER} header and throws a 401 H3Error if it is
 * absent. Returns the user-ID string when present.
 */
export function requireTestSession(event: H3Event): string {
	const id = getHeader(event, TEST_AUTH_HEADER);
	if (!id) {
		throw createError({ message: "Unauthorized", status: 401, statusMessage: "Unauthorized" });
	}
	return id;
}

/**
 * Asserts that a `Response` carries the standard rate-limit headers emitted by
 * `defineWrappedResponseHandler` on every successful request.
 *
 * Only call this against responses from endpoints that use the wrapped handler
 * (i.e. all authenticated guild/user routes). The public `/api` health endpoint
 * does **not** use the wrapper and therefore does not emit these headers.
 */
export function assertRateLimitHeaders(res: Response): void {
	const limit = res.headers.get("x-ratelimit-limit");
	const remaining = res.headers.get("x-ratelimit-remaining");
	const reset = res.headers.get("x-ratelimit-reset");

	expect(limit, "x-ratelimit-limit should be present").toBeTruthy();
	expect(remaining, "x-ratelimit-remaining should be present").not.toBeNull();
	expect(reset, "x-ratelimit-reset should be present").toBeTruthy();
}
