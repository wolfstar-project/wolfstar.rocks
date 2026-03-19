/**
 * Validates if a URL is a safe redirect path.
 * Only allows relative paths starting with "/" to prevent open-redirect and XSS attacks.
 *
 * @param url - The URL to validate
 * @returns true if the URL is a safe relative path, false otherwise
 *
 * @example
 * isSafeRedirectPath("/guilds/123") // true
 * isSafeRedirectPath("https://evil.com") // false
 * isSafeRedirectPath("javascript:alert(1)") // false
 */
export function isSafeRedirectPath(url: unknown): boolean {
	// Only accept strings
	if (typeof url !== "string") {
		return false;
	}

	// Reject any string containing ASCII control characters (0x00-0x1F, 0x7F)
	// This prevents header injection and other attacks
	// CRITICAL: Check BEFORE trimming to prevent "\n/ok" from becoming "/ok"
	// oxlint-disable-next-line no-control-regex
	if (/[\x00-\x1F\x7F]/.test(url)) {
		return false;
	}

	// Reject any string with leading/trailing whitespace
	// This ensures the original string is clean (no " /ok" or "/ok ")
	if (url !== url.trim()) {
		return false;
	}

	// At this point, url is guaranteed to have no control chars or whitespace padding
	const path = url;

	// Reject empty strings
	if (path.length === 0) {
		return false;
	}

	// Reject any string containing backslash - backslashes have no place in valid URL paths
	// This prevents tricks like /path\evil.com or browser normalization attacks
	if (path.includes("\\")) {
		return false;
	}

	// Must start with exactly one forward slash
	if (!path.startsWith("/")) {
		return false;
	}

	// Reject protocol-relative URLs (//example.com)
	if (path.startsWith("//")) {
		return false;
	}

	// Reject percent-encoded attacks
	const lowerPath = path.toLowerCase();

	// Reject encoded backslash at start (/%5c)
	if (lowerPath.startsWith("/%5c")) {
		return false;
	}

	// Reject encoded double-slash patterns (/%2f%2f or /%2f/)
	if (lowerPath.startsWith("/%2f%2f") || lowerPath.startsWith("/%2f/")) {
		return false;
	}

	// Reject dangerous protocols (javascript:, data:, vbscript:, etc.)
	// Case-insensitive check for common attack vectors
	// This is defense-in-depth since we already validated the path starts with /
	const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:", "about:"];

	for (const protocol of dangerousProtocols) {
		if (lowerPath.includes(protocol)) {
			return false;
		}
	}

	// All checks passed - this is a safe relative path
	return true;
}
