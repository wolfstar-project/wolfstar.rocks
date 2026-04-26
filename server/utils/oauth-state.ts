import { runtimeConfig } from "#server/utils/runtimeConfig";

/**
 * OAuth state payload — contains only CSRF fields (nonce + timestamp).
 * The redirect URL is bound in the HMAC signature but NOT embedded here,
 * so the state string never exposes the destination to the client.
 */
export interface OAuthStatePayload {
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
 * Creates a signed OAuth state parameter + nonce for CSRF protection.
 *
 * The state payload contains only CSRF fields (nonce + timestamp). The
 * redirect URL is cryptographically bound via the HMAC signature but is
 * NOT embedded in the state string, so it is never exposed to the client.
 *
 * Signature covers: "nonce|ts|redirectUrl"
 *
 * @param redirectUrl - The URL to redirect to after OAuth (HMAC-bound)
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

	// HMAC message binds the redirect URL even though it is not in the payload
	const message = `${nonce}|${ts}|${redirectUrl}`;

	// Sign the message with HMAC-SHA256
	const sig = await hmacSign(message, runtimeConfig.session.password);

	// Payload intentionally omits url — it is stored server-side in a cookie
	const payload: SignedOAuthStatePayload = { nonce, ts, sig };

	// Base64url-encode the JSON payload
	const state = toBase64Url(JSON.stringify(payload));

	return { state, nonce };
}

const STATE_TTL_MS = 5 * 60 * 1000;
const CLOCK_SKEW_TOLERANCE_MS = 30 * 1000;

/** Discriminated union returned by {@link verifyOAuthState}. */
export type OAuthStateVerifyResult =
	| { valid: true }
	| {
			valid: false;
			reason: "decode-failed" | "missing-fields" | "nonce-mismatch" | "expired" | "bad-hmac";
	  };

/**
 * Verifies a signed OAuth state parameter.
 *
 * Checks:
 * 1. The state can be decoded and parsed
 * 2. All required fields are present
 * 3. The nonce matches the expected value (from cookie)
 * 4. The timestamp is within 5 minutes (TTL)
 * 5. The signature is valid (HMAC-SHA256 over "nonce|ts|redirectUrl")
 *
 * @param state - The base64url-encoded state string
 * @param expectedNonce - The nonce from the cookie (CSRF protection)
 * @param redirectUrl - The redirect URL from the cookie (must match HMAC binding)
 * @returns `{ valid: true }` on success, or `{ valid: false; reason }` on failure where `reason` is one of:
 *   - `"decode-failed"` — state could not be base64url-decoded or JSON-parsed
 *   - `"missing-fields"` — parsed payload is missing required fields (`nonce`, `ts`, `sig`)
 *   - `"nonce-mismatch"` — nonce in payload does not match the expected cookie nonce
 *   - `"expired"` — timestamp is older than 5 minutes or more than 30 s in the future
 *   - `"bad-hmac"` — HMAC-SHA256 signature verification failed
 */
export async function verifyOAuthState(
	state: string,
	expectedNonce: string,
	redirectUrl: string,
): Promise<OAuthStateVerifyResult> {
	let decoded: string;
	try {
		decoded = fromBase64Url(state);
	} catch {
		return { valid: false, reason: "decode-failed" };
	}

	let payload: SignedOAuthStatePayload;
	try {
		const parsed: unknown = JSON.parse(decoded);
		if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
			return { valid: false, reason: "missing-fields" };
		}
		payload = parsed as SignedOAuthStatePayload;
	} catch {
		return { valid: false, reason: "decode-failed" };
	}

	if (
		typeof payload.nonce !== "string" ||
		typeof payload.ts !== "number" ||
		typeof payload.sig !== "string"
	) {
		return { valid: false, reason: "missing-fields" };
	}

	if (payload.nonce !== expectedNonce) {
		return { valid: false, reason: "nonce-mismatch" };
	}

	const now = Date.now();
	const age = now - payload.ts;
	if (age > STATE_TTL_MS || age < -CLOCK_SKEW_TOLERANCE_MS) {
		return { valid: false, reason: "expired" };
	}

	const message = `${payload.nonce}|${payload.ts}|${redirectUrl}`;
	let expectedSig: string;
	try {
		expectedSig = await hmacSign(message, runtimeConfig.session.password);
	} catch {
		return { valid: false, reason: "bad-hmac" };
	}
	if (!timingSafeEqual(payload.sig, expectedSig)) {
		return { valid: false, reason: "bad-hmac" };
	}

	return { valid: true };
}
