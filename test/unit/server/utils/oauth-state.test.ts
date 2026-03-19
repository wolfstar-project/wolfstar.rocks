import { createOAuthState, verifyOAuthState } from "#server/utils/oauth-state";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the runtimeConfig
vi.mock("#server/utils/runtimeConfig", () => ({
	runtimeConfig: {
		session: { password: "test-secret-password-for-unit-tests-32chars" },
	},
}));

describe("createOAuthState", () => {
	it("should return a state string and nonce", async () => {
		const result = await createOAuthState("/guilds/123");

		expect(result).toHaveProperty("state");
		expect(result).toHaveProperty("nonce");
		expect(typeof result.state).toBe("string");
		expect(typeof result.nonce).toBe("string");
	});

	it("state should be base64url-encoded (no + / = chars)", async () => {
		const result = await createOAuthState("/test/path");

		expect(result.state).not.toMatch(/[+/=]/);
	});

	it("should NOT contain the redirect URL in the decoded payload", async () => {
		const redirectUrl = "/guilds/456";
		const result = await createOAuthState(redirectUrl);

		// Decode the state and confirm url is absent (stored in cookie, not state)
		const base64 = result.state.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(base64);
		const payload = JSON.parse(decoded);

		expect(payload).not.toHaveProperty("url");
		expect(payload).toHaveProperty("nonce");
		expect(payload).toHaveProperty("ts");
		expect(payload).toHaveProperty("sig");
	});

	it("nonce in payload should match returned nonce", async () => {
		const result = await createOAuthState("/test");

		const base64 = result.state.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(base64);
		const payload = JSON.parse(decoded);

		expect(payload.nonce).toBe(result.nonce);
	});

	it("timestamp should be within the last second", async () => {
		const before = Date.now();
		const result = await createOAuthState("/test");
		const after = Date.now();

		const base64 = result.state.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(base64);
		const payload = JSON.parse(decoded);

		expect(payload.ts).toBeGreaterThanOrEqual(before);
		expect(payload.ts).toBeLessThanOrEqual(after);
	});

	it("two calls should produce different nonces and different states", async () => {
		const result1 = await createOAuthState("/test");
		const result2 = await createOAuthState("/test");

		expect(result1.nonce).not.toBe(result2.nonce);
		expect(result1.state).not.toBe(result2.state);
	});
});

describe("verifyOAuthState", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should return true for a valid state, correct nonce, and matching redirectUrl", async () => {
		const now = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(now);

		const redirectUrl = "/guilds/789";
		const { state, nonce } = await createOAuthState(redirectUrl);

		const result = await verifyOAuthState(state, nonce, redirectUrl);
		expect(result).toBe(true);
	});

	it("should return false when redirectUrl does not match HMAC binding", async () => {
		const now = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(now);

		const { state, nonce } = await createOAuthState("/guilds/789");

		// Tampered redirect URL — not the one that was HMAC-signed
		const result = await verifyOAuthState(state, nonce, "/evil/path");
		expect(result).toBe(false);
	});

	it("should return false for a tampered nonce in payload", async () => {
		const now = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(now);

		const { state, nonce } = await createOAuthState("/guilds/123");

		// Decode, tamper with nonce, re-encode (without re-signing)
		const base64 = state.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(base64);
		const payload = JSON.parse(decoded);
		payload.nonce = "tampered-nonce-value"; // Tampered nonce
		const tamperedJson = JSON.stringify(payload);
		const tamperedState = btoa(tamperedJson)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");

		// nonce check fails before HMAC check
		const verifyResult = await verifyOAuthState(tamperedState, nonce, "/guilds/123");
		expect(verifyResult).toBe(false);
	});

	it("should return null for a tampered signature", async () => {
		const now = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(now);

		const createResult = await createOAuthState("/guilds/123");
		const state = createResult.state;
		const nonce = createResult.nonce;

		// Decode, tamper with signature, re-encode
		const base64 = state.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(base64);
		const payload = JSON.parse(decoded);
		payload.sig = "0".repeat(64); // Invalid signature
		const tamperedJson = JSON.stringify(payload);
		const tamperedState = btoa(tamperedJson)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");

		const verifyResult = await verifyOAuthState(tamperedState, nonce, "/guilds/123");
		expect(verifyResult).toBe(false);
	});

	it("should return false for garbage/empty input", async () => {
		expect(await verifyOAuthState("", "nonce123", "/")).toBe(false);
		expect(await verifyOAuthState("garbage!!!", "nonce123", "/")).toBe(false);
		expect(await verifyOAuthState("not-valid-base64", "nonce", "/")).toBe(false);
	});

	it("should return false for wrong nonce (CSRF protection)", async () => {
		const now = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(now);

		const { state } = await createOAuthState("/guilds/123");

		// Use wrong nonce
		const result = await verifyOAuthState(state, "wrong-nonce-value", "/guilds/123");
		expect(result).toBe(false);
	});

	it("should return false for expired state (>5 min old)", async () => {
		const now = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(now);

		const { state, nonce } = await createOAuthState("/guilds/123");

		// Fast-forward 6 minutes
		vi.advanceTimersByTime(6 * 60 * 1000);

		const result = await verifyOAuthState(state, nonce, "/guilds/123");
		expect(result).toBe(false);
	});

	it("should return false if ts field is missing", async () => {
		const now = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(now);

		const { state, nonce } = await createOAuthState("/guilds/123");

		// Decode and remove ts field
		const base64 = state.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(base64);
		const payload = JSON.parse(decoded);
		delete payload.ts;
		const modifiedJson = JSON.stringify(payload);
		const modifiedState = btoa(modifiedJson)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");

		const result = await verifyOAuthState(modifiedState, nonce, "/guilds/123");
		expect(result).toBe(false);
	});

	it("should return false for malformed JSON", async () => {
		// Create a base64url-encoded string that's not valid JSON
		const malformed = btoa("{not valid json")
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");

		const result = await verifyOAuthState(malformed, "nonce123", "/");
		expect(result).toBe(false);
	});

	it("should return false for state with timestamp in the future (>30s)", async () => {
		// Set time to "present"
		const presentTime = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(presentTime);

		// Create state at "present" time
		const { state, nonce } = await createOAuthState("/guilds/123");

		// Now verify from 60 seconds in the "past" (making the state appear 60s in future)
		vi.setSystemTime(new Date(presentTime.getTime() - 60_000));

		const result = await verifyOAuthState(state, nonce, "/guilds/123");
		expect(result).toBe(false);
	});

	it("should handle redirect URL with unicode characters correctly", async () => {
		const now = new Date("2024-01-01T00:00:00.000Z");
		vi.setSystemTime(now);

		const unicodeUrl = "/path/with/\u00E9nonc\u00E9?q=\u00F1";
		const { state, nonce } = await createOAuthState(unicodeUrl);

		const result = await verifyOAuthState(state, nonce, unicodeUrl);
		expect(result).toBe(true);
	});
});
