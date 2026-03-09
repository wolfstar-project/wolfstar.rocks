import { runtimeConfig } from "#server/utils/runtimeConfig";

export interface OAuthStatePayload {
	url: string;
	nonce: string;
	ts: number;
}

interface SignedOAuthStatePayload extends OAuthStatePayload {
	sig: string;
}

/**
 * Encode a string to base64url (UTF-8 safe, RFC 4648)
 */
function toBase64Url(str: string): string {
	const bytes = new TextEncoder().encode(str);
	const binStr = Array.from(bytes)
		.map((b) => String.fromCharCode(b))
		.join("");
	return btoa(binStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Decode a base64url string to original string (UTF-8 safe, padding-restored)
 */
function fromBase64Url(str: string): string {
	// Restore base64 padding
	const padded = str.replace(/-/g, "+").replace(/_/g, "/");
	const paddingNeeded = (4 - (padded.length % 4)) % 4;
	const withPadding = padded + "=".repeat(paddingNeeded);
	const binStr = atob(withPadding);
	const bytes = new Uint8Array(binStr.length);
	for (let i = 0; i < binStr.length; i++) {
		bytes[i] = binStr.charCodeAt(i);
	}
	return new TextDecoder().decode(bytes);
}

/**
 * Sign a message using HMAC-SHA256 with the session password
 */
async function hmacSign(message: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

/**
 * Creates a signed OAuth state parameter + nonce for CSRF protection
 *
 * The state is a base64url-encoded JSON payload containing:
 * - url: the redirect URL
 * - nonce: a random 32-byte hex string (stored in cookie separately)
 * - ts: timestamp in milliseconds
 * - sig: HMAC-SHA256 signature over "url|nonce|ts"
 *
 * @param redirectUrl - The URL to redirect to after OAuth
 * @returns Object with base64url-encoded state string and nonce
 */
export async function createOAuthState(
	redirectUrl: string,
): Promise<{ state: string; nonce: string }> {
	// Generate random 32-byte nonce
	const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
	const nonce = Array.from(nonceBytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	const ts = Date.now();

	// Create the message to sign: "url|nonce|ts"
	const message = `${redirectUrl}|${nonce}|${ts}`;

	// Sign the message with HMAC-SHA256
	const sig = await hmacSign(message, runtimeConfig.session.password);

	// Create the complete payload
	const payload: SignedOAuthStatePayload = {
		url: redirectUrl,
		nonce,
		ts,
		sig,
	};

	// Base64url-encode the JSON payload
	const state = toBase64Url(JSON.stringify(payload));

	return { state, nonce };
}

/**
 * Verifies a signed OAuth state parameter
 *
 * Checks:
 * 1. The state can be decoded and parsed
 * 2. All required fields are present
 * 3. The nonce matches the expected value (from cookie)
 * 4. The timestamp is within 5 minutes (TTL)
 * 5. The signature is valid (HMAC-SHA256 over "url|nonce|ts")
 *
 * @param state - The base64url-encoded state string
 * @param expectedNonce - The nonce from the cookie (CSRF protection)
 * @returns The redirect URL if valid, null otherwise
 */
export async function verifyOAuthState(
	state: string,
	expectedNonce: string,
): Promise<string | null> {
	try {
		// Decode from base64url
		const decoded = fromBase64Url(state);
		const payload: SignedOAuthStatePayload = JSON.parse(decoded);

		// Check all required fields exist
		if (
			typeof payload.url !== "string" ||
			typeof payload.nonce !== "string" ||
			typeof payload.ts !== "number" ||
			typeof payload.sig !== "string"
		) {
			return null;
		}

		// Check nonce matches (CSRF protection)
		if (payload.nonce !== expectedNonce) {
			return null;
		}

		// Check timestamp TTL (5 minutes)
		const now = Date.now();
		const age = now - payload.ts;
		if (age > 5 * 60 * 1000) {
			return null;
		}

		// Reject future timestamps (clock skew protection — max 30 seconds in the future)
		if (age < -30 * 1000) {
			return null;
		}

		// Re-compute signature from the payload
		const message = `${payload.url}|${payload.nonce}|${payload.ts}`;
		const expectedSig = await hmacSign(message, runtimeConfig.session.password);

		// Timing-safe signature comparison
		const signaturesMatch = timingSafeEqual(payload.sig, expectedSig);
		if (!signaturesMatch) {
			return null;
		}

		// All checks passed, return the redirect URL
		return payload.url;
	} catch {
		// Any error during decode/parse means invalid state
		return null;
	}
}
