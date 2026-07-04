import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization tests for the OAuth callback sequencing (plan 002).
 *
 * These tests drive the REAL `/api/auth/discord` route module. The finding
 * under test: during the callback leg (`?code=...`) the endpoint exchanges
 * the authorization code and creates a session WITHOUT validating the CSRF
 * `state`; state verification happens later in a separate endpoint
 * (`/api/auth/verify-state`) that the client calls only AFTER the session
 * already exists.
 *
 * Plan 003 must flip the `it.fails` invariants below into passing tests by
 * making the exchange endpoint verify (and consume) the state atomically
 * before any token exchange or session mutation.
 */

const {
	mockSetUserSession,
	mockSetCookie,
	mockVerifyOAuthState,
	mockCreateOAuthState,
	callOrder,
	queryRef,
} = vi.hoisted(() => {
	const callOrder: string[] = [];
	const mockSetUserSession = vi.fn(async () => {
		callOrder.push("setUserSession");
	});
	const mockSetCookie = vi.fn();
	const mockVerifyOAuthState = vi.fn(async () => {
		callOrder.push("verifyOAuthState");
		return { valid: true as const };
	});
	const mockCreateOAuthState = vi.fn(async () => ({
		state: "generated-state",
		nonce: "generated-nonce",
	}));
	const queryRef: { current: Record<string, unknown> } = { current: {} };

	// Simulates nuxt-auth-utils: a successful Discord code exchange invokes
	// onSuccess with user + tokens.
	const mockDefineOAuthDiscordEventHandler = vi.fn(
		(opts: {
			onSuccess: (
				event: unknown,
				payload: { user: Record<string, unknown>; tokens: Record<string, unknown> },
			) => Promise<void>;
		}) => {
			return async (event: unknown) => {
				callOrder.push("tokenExchange");
				await opts.onSuccess(event, {
					user: {
						id: "user-1",
						username: "tester",
						global_name: "Tester",
						avatar: null,
						email: null,
					},
					tokens: { access_token: "at", refresh_token: "rt", expires_in: 604800 },
				});
			};
		},
	);

	const g = globalThis as Record<string, unknown>;
	g.defineWrappedResponseHandler = (fn: unknown) => fn;
	g.getQuery = () => queryRef.current;
	g.setCookie = mockSetCookie;
	g.setUserSession = mockSetUserSession;
	g.defineOAuthDiscordEventHandler = mockDefineOAuthDiscordEventHandler;
	g.seconds = (n: number) => n * 1000;

	return {
		mockSetUserSession,
		mockSetCookie,
		mockDefineOAuthDiscordEventHandler,
		mockVerifyOAuthState,
		mockCreateOAuthState,
		callOrder,
		queryRef,
	};
});

vi.mock("evlog", async (importOriginal) => {
	const actual = await importOriginal<typeof import("evlog")>();
	return {
		...actual,
		useLogger: vi.fn().mockReturnValue({
			set: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		}),
		withAuditMethods: vi.fn((logger: Record<string, unknown>) => ({
			...logger,
			audit: vi.fn(),
		})),
		createError: vi.fn((opts: Record<string, unknown>) =>
			Object.assign(new Error(String(opts["message"])), opts),
		),
	};
});

vi.mock("#server/utils/discord/cache", () => ({
	invalidateCurrentUserCache: vi.fn(async () => undefined),
}));

vi.mock("#server/utils/oauth-state", () => ({
	createOAuthState: mockCreateOAuthState,
	verifyOAuthState: mockVerifyOAuthState,
}));

import discordAuthHandler from "#server/api/auth/discord.get";

const callHandler = discordAuthHandler as unknown as (event: H3Event) => Promise<unknown>;

function makeEvent(): H3Event {
	return {
		node: { req: { method: "GET", socket: {} } },
		headers: new Headers(),
	} as unknown as H3Event;
}

describe("/api/auth/discord callback sequencing", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		callOrder.length = 0;
	});

	it("generates state and nonce cookies during initiation (no code)", async () => {
		queryRef.current = { next: "/profile" };

		await callHandler(makeEvent());

		expect(mockCreateOAuthState).toHaveBeenCalledWith("/profile");
		const cookieNames = mockSetCookie.mock.calls.map((call) => call[1]);
		expect(cookieNames).toContain("oauth_nonce");
		expect(cookieNames).toContain("oauth_redirect");
	});

	it("currently exchanges the code and creates a session without any state validation (documented regression)", async () => {
		queryRef.current = { code: "auth-code" };

		await callHandler(makeEvent());

		// Regression: the session is created even though the endpoint never
		// saw — let alone verified — the CSRF state.
		expect(callOrder).toEqual(["tokenExchange", "setUserSession"]);
		expect(mockVerifyOAuthState).not.toHaveBeenCalled();
		expect(mockSetUserSession).toHaveBeenCalledTimes(1);
	});

	// SECURITY INVARIANT (plan 003 must make this pass): state verification
	// must happen before the token exchange, in the same request.
	it.fails("verifies the OAuth state before exchanging the code", async () => {
		queryRef.current = { code: "auth-code", state: "client-state" };

		await callHandler(makeEvent());

		expect(mockVerifyOAuthState).toHaveBeenCalled();
		expect(callOrder.indexOf("verifyOAuthState")).toBeLessThan(
			callOrder.indexOf("tokenExchange"),
		);
	});

	// SECURITY INVARIANT (plan 003 must make this pass): a callback without a
	// valid state must never create or refresh a session.
	it.fails("does not create a session when the state is missing", async () => {
		queryRef.current = { code: "auth-code" };

		await callHandler(makeEvent()).catch(() => {
			// plan 003 should reject with a 400 — swallow it for the assertion
		});

		expect(mockSetUserSession).not.toHaveBeenCalled();
	});
});
