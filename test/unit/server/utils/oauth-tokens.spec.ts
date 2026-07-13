import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetAccessToken, mockRefreshToken } = vi.hoisted(() => {
	const mockGetAccessToken = vi.fn();
	const mockRefreshToken = vi.fn();

	(globalThis as Record<string, unknown>).serverAuth = () => ({
		api: {
			getAccessToken: mockGetAccessToken,
			refreshToken: mockRefreshToken,
		},
	});

	return { mockGetAccessToken, mockRefreshToken };
});

import type { H3Event } from "h3";
import { refreshSessionTokens } from "#server/utils/oauth-tokens";

const fakeEvent = { headers: new Headers() } as H3Event;

describe("refreshSessionTokens", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the access token from Better Auth's getAccessToken by default", async () => {
		mockGetAccessToken.mockResolvedValue({ accessToken: "access-token" });

		const result = await refreshSessionTokens(fakeEvent);

		expect(mockGetAccessToken).toHaveBeenCalledWith({
			body: { providerId: "discord" },
			headers: fakeEvent.headers,
		});
		expect(mockRefreshToken).not.toHaveBeenCalled();
		expect(result).toEqual({ access_token: "access-token" });
	});

	it("forces a refresh via Better Auth's refreshToken when force is set", async () => {
		mockRefreshToken.mockResolvedValue({ accessToken: "forced-access-token" });

		const result = await refreshSessionTokens(fakeEvent, { force: true });

		expect(mockRefreshToken).toHaveBeenCalledWith({
			body: { providerId: "discord" },
			headers: fakeEvent.headers,
		});
		expect(mockGetAccessToken).not.toHaveBeenCalled();
		expect(result).toEqual({ access_token: "forced-access-token" });
	});

	it("returns null when there is no linked Discord account", async () => {
		mockGetAccessToken.mockResolvedValue({ accessToken: undefined });

		const result = await refreshSessionTokens(fakeEvent);

		expect(result).toBeNull();
	});

	it("returns null when Better Auth rejects the request", async () => {
		mockGetAccessToken.mockRejectedValue(new Error("invalid_grant"));

		const result = await refreshSessionTokens(fakeEvent);

		expect(result).toBeNull();
	});
});
