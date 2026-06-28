import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	mockGetUserSession,
	mockSetUserSession,
	mockClearUserSession,
	mockRefreshToken,
	mockAudit,
} = vi.hoisted(() => {
	const mockGetUserSession = vi.fn();
	const mockSetUserSession = vi.fn();
	const mockClearUserSession = vi.fn();
	const mockRefreshToken = vi.fn();
	const mockAudit = vi.fn();

	(globalThis as Record<string, unknown>).getUserSession = mockGetUserSession;
	(globalThis as Record<string, unknown>).setUserSession = mockSetUserSession;
	(globalThis as Record<string, unknown>).clearUserSession = mockClearUserSession;
	(globalThis as Record<string, unknown>).useApi = () => ({
		oauth2: { refreshToken: mockRefreshToken },
	});

	return {
		mockAudit,
		mockClearUserSession,
		mockGetUserSession,
		mockRefreshToken,
		mockSetUserSession,
	};
});

vi.mock("evlog", async (importOriginal) => {
	const actual = await importOriginal<typeof import("evlog")>();
	return {
		...actual,
		useLogger: () => ({
			set: vi.fn(),
			info: vi.fn(),
			error: vi.fn(),
			audit: mockAudit,
		}),
		withAuditMethods: (logger: unknown) => logger,
	};
});

vi.mock("#server/utils/runtimeConfig", () => ({
	runtimeConfig: {
		oauth: {
			discord: {
				clientId: "client-id",
				clientSecret: "client-secret",
			},
		},
	},
}));

import type { H3Event } from "h3";
import { isAccessTokenExpired, refreshSessionTokens } from "#server/utils/oauth-tokens";

const fakeEvent = {} as H3Event;

const freshTokens = {
	access_token: "access-token",
	refresh_token: "refresh-token",
	expires_in: 604_800,
	token_type: "Bearer",
};

describe("isAccessTokenExpired", () => {
	it("returns true when expires_in is missing", () => {
		expect(isAccessTokenExpired(undefined, Date.now())).toBe(true);
	});

	it("returns false when the token is still valid beyond the refresh buffer", () => {
		const loggedInAt = Date.now();
		expect(isAccessTokenExpired(604_800, loggedInAt)).toBe(false);
	});

	it("returns true when the token is within the one-hour refresh buffer", () => {
		const loggedInAt = Date.now() - 604_800 * 1000 + 30 * 60 * 1000;
		expect(isAccessTokenExpired(604_800, loggedInAt)).toBe(true);
	});
});

describe("refreshSessionTokens", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSetUserSession.mockResolvedValue(undefined);
		mockClearUserSession.mockResolvedValue(undefined);
	});

	it("returns existing tokens when they are still fresh", async () => {
		mockGetUserSession.mockResolvedValue({
			loggedInAt: Date.now(),
			secure: { tokens: freshTokens },
			user: { id: "user-1" },
		});

		const result = await refreshSessionTokens(fakeEvent);

		expect(result).toEqual(freshTokens);
		expect(mockRefreshToken).not.toHaveBeenCalled();
	});

	it("refreshes tokens when they are near expiry", async () => {
		const refreshedTokens = {
			...freshTokens,
			access_token: "new-access-token",
		};

		mockGetUserSession.mockResolvedValue({
			loggedInAt: Date.now() - 604_800 * 1000 + 30 * 60 * 1000,
			secure: { tokens: freshTokens },
			user: { id: "user-1" },
		});
		mockRefreshToken.mockResolvedValue(refreshedTokens);

		const result = await refreshSessionTokens(fakeEvent);

		expect(mockRefreshToken).toHaveBeenCalledWith({
			client_id: "client-id",
			client_secret: "client-secret",
			grant_type: "refresh_token",
			refresh_token: "refresh-token",
		});
		expect(mockSetUserSession).toHaveBeenCalledWith(fakeEvent, {
			loggedInAt: expect.any(Number),
			secure: { tokens: refreshedTokens },
		});
		expect(result).toEqual(refreshedTokens);
	});

	it("forces a refresh even when the token is not near expiry", async () => {
		const refreshedTokens = {
			...freshTokens,
			access_token: "forced-access-token",
		};

		mockGetUserSession.mockResolvedValue({
			loggedInAt: Date.now(),
			secure: { tokens: freshTokens },
			user: { id: "user-1" },
		});
		mockRefreshToken.mockResolvedValue(refreshedTokens);

		const result = await refreshSessionTokens(fakeEvent, { force: true });

		expect(mockRefreshToken).toHaveBeenCalled();
		expect(result).toEqual(refreshedTokens);
	});

	it("clears the session when refresh tokens are missing", async () => {
		mockGetUserSession.mockResolvedValue({
			loggedInAt: Date.now() - 604_800 * 1000,
			secure: { tokens: { access_token: "access-token" } },
			user: { id: "user-1" },
		});

		const result = await refreshSessionTokens(fakeEvent);

		expect(result).toBeNull();
		expect(mockClearUserSession).toHaveBeenCalledWith(fakeEvent);
	});

	it("clears the session when Discord rejects the refresh token", async () => {
		mockGetUserSession.mockResolvedValue({
			loggedInAt: Date.now() - 604_800 * 1000,
			secure: { tokens: freshTokens },
			user: { id: "user-1" },
		});
		mockRefreshToken.mockRejectedValue(new Error("invalid_grant"));

		const result = await refreshSessionTokens(fakeEvent);

		expect(result).toBeNull();
		expect(mockClearUserSession).toHaveBeenCalledWith(fakeEvent);
	});
});
