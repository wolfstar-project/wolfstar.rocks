const TRANSIENT_ERROR_CODES = new Set([
	"ECONNRESET",
	"ECONNREFUSED",
	"EPIPE",
	"ETIMEDOUT",
	"EAI_AGAIN",
	"UND_ERR_SOCKET",
	"UND_ERR_CONNECT_TIMEOUT",
	"UND_ERR_HEADERS_TIMEOUT",
	"UND_ERR_BODY_TIMEOUT",
]);

const TRANSIENT_MESSAGE_RE =
	/socket hang up|econnreset|network.?error|fetch failed|other side closed|aborted|und_err_/i;

function readErrorCode(error: unknown): string | undefined {
	if (!error || typeof error !== "object") {
		return undefined;
	}
	if ("code" in error && typeof error.code === "string") {
		return error.code;
	}
	if ("cause" in error) {
		return readErrorCode(error.cause);
	}
	return undefined;
}

function readErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		const causeMessage =
			"cause" in error && error.cause instanceof Error ? ` ${error.cause.message}` : "";
		return `${error.message}${causeMessage}`;
	}
	if (typeof error === "string") {
		return error;
	}
	return "";
}

/**
 * Detects transient TCP / HTTP client failures that are safe to retry,
 * including mid-body resets ("socket hang up" after a 200) from Netlify Blobs.
 */
export function isTransientNetworkError(error: unknown): boolean {
	const code = readErrorCode(error);
	if (code && TRANSIENT_ERROR_CODES.has(code)) {
		return true;
	}
	return TRANSIENT_MESSAGE_RE.test(readErrorMessage(error));
}
