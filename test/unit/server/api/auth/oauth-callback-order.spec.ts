import type { OAuthStateVerifyResult } from "#server/utils/oauth-state";
import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Sequencing tests for `/api/auth/discord` (plans 002 + 003).
 *
 * The callback leg (`?code=...&state=...`) must atomically verify and consume
 * the CSRF state BEFORE exchanging the authorization code or mutating the
 * session. A failed state must never change authentication state, and the
 * one-time cookies must be consumed on both success and failure.
 */

const {
	mockSetUserSession,
	mockSetCookie,
	mockGetCookie,
	mockDeleteCookie,
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
	const mockGetCookie = vi.fn();
	const mockDeleteCookie = vi.fn();
	const mockVerifyOAuthState = vi.fn(async (): Promise<OAuthStateVerifyResult> => {
		callOrder.push("verifyOAuthState");
		return { valid: true };
	});
	const mockCreateOAuthState = vi.fn(async () => ({
		state: "generated-state",
		nonce: "generated-nonce",
	}));
	const queryRef: { current: Record<string, unknown> } = { current: {} };

	// Simulates nuxt-auth-utils: a successful Discord code exchange invokes
	// onSuccess with user + tokens and returns its result.
	const mockDefineOAuthDiscordEventHandler = vi.fn(
		(opts: {
			onSuccess: (
				event: unknown,
				payload: { user: Record<string, unknown>; tokens: Record<string, unknown> },
			) => Promise<unknown>;
		}) => {
			return async (event: unknown) => {
				callOrder.push("tokenExchange");
				return opts.onSuccess(event, {
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
	g.getCookie = mockGetCookie;
	g.deleteCookie = mockDeleteCookie;
	g.setUserSession = mockSetUserSession;
	g.defineOAuthDiscordEventHandler = mockDefineOAuthDiscordEventHandler;
	g.seconds = (n: number) => n * 1000;

	return {
		mockSetUserSession,
		mockSetCookie,
		mockGetCookie,
		mockDeleteCookie,
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

function givenValidCallbackCookies() {
	mockGetCookie.mockImplementation((_event: unknown, name: string) => {
		if (name === "oauth_nonce") return "cookie-nonce";
		if (name === "oauth_redirect") return "/profile";
		return undefined;
	});
}

describe("/api/auth/discord callback sequencing", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		callOrder.length = 0;
		mockGetCookie.mockReturnValue(undefined);
		mockVerifyOAuthState.mockImplementation(async () => {
			callOrder.push("verifyOAuthState");
			return { valid: true as const };
		});
	});

	it("generates state and nonce cookies during initiation (no code)", async () => {
		queryRef.current = { next: "/profile" };

		await callHandler(makeEvent());

		expect(mockCreateOAuthState).toHaveBeenCalledWith("/profile");
		const cookieNames = mockSetCookie.mock.calls.map((call) => call[1]);
		expect(cookieNames).toContain("oauth_nonce");
		expect(cookieNames).toContain("oauth_redirect");
	});

	it("verifies the OAuth state before exchanging the code or creating a session", async () => {
		queryRef.current = { code: "auth-code", state: "client-state" };
		givenValidCallbackCookies();

		const response = await callHandler(makeEvent());

		expect(mockVerifyOAuthState).toHaveBeenCalledWith(
			"client-state",
			"cookie-nonce",
			"/profile",
		);
		expect(callOrder).toEqual(["verifyOAuthState", "tokenExchange", "setUserSession"]);
		expect(response).toEqual({ redirectUrl: "/profile" });
	});

	it("consumes the one-time cookies on success", async () => {
		queryRef.current = { code: "auth-code", state: "client-state" };
		givenValidCallbackCookies();

		await callHandler(makeEvent());

		const deleted = mockDeleteCookie.mock.calls.map((call) => call[1]);
		expect(deleted).toContain("oauth_nonce");
		expect(deleted).toContain("oauth_redirect");
	});

	it("rejects and never exchanges or creates a session when the state is missing", async () => {
		queryRef.current = { code: "auth-code" };
		givenValidCallbackCookies();

		await expect(callHandler(makeEvent())).rejects.toThrow("State verification failed");

		expect(callOrder).toEqual([]);
		expect(mockSetUserSession).not.toHaveBeenCalled();
	});

	it("rejects and consumes cookies when the state is invalid", async () => {
		queryRef.current = { code: "auth-code", state: "tampered-state" };
		givenValidCallbackCookies();
		mockVerifyOAuthState.mockResolvedValue({ valid: false, reason: "bad-hmac" });

		await expect(callHandler(makeEvent())).rejects.toThrow("State verification failed");

		expect(mockSetUserSession).not.toHaveBeenCalled();
		expect(callOrder).not.toContain("tokenExchange");
		const deleted = mockDeleteCookie.mock.calls.map((call) => call[1]);
		expect(deleted).toContain("oauth_nonce");
		expect(deleted).toContain("oauth_redirect");
	});

	it("rejects when the nonce or redirect cookie is absent", async () => {
		queryRef.current = { code: "auth-code", state: "client-state" };

		await expect(callHandler(makeEvent())).rejects.toThrow("State verification failed");

		expect(mockVerifyOAuthState).not.toHaveBeenCalled();
		expect(mockSetUserSession).not.toHaveBeenCalled();
	});

	it("falls back to a safe redirect when the stored redirect URL is unsafe", async () => {
		queryRef.current = { code: "auth-code", state: "client-state" };
		mockGetCookie.mockImplementation((_event: unknown, name: string) => {
			if (name === "oauth_nonce") return "cookie-nonce";
			if (name === "oauth_redirect") return "https://evil.example.com/phish";
			return undefined;
		});

		const response = await callHandler(makeEvent());

		expect(response).toEqual({ redirectUrl: "/" });
	});
});
