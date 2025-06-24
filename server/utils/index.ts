import type { H3Event } from 'h3';

/**
 * Get client IP safely
 */
export function getClientIP(event: H3Event): string {
	const forwarded = event.node.req.headers['x-forwarded-for'];
	if (forwarded) {
		return Array.isArray(forwarded) ? forwarded[0] || 'Unknown' : forwarded.split(',')[0] || 'Unknown';
	}

	return event.node.req.headers['X-Real-IP']?.[0] ?? event.node.req.socket?.remoteAddress ?? 'Unknown';
}

export function getErrorStatusCode(error: unknown): number | undefined {
	if (error && typeof error === 'object' && 'statusCode' in error) {
		return error.statusCode as number;
	}
	if (error && typeof error === 'object' && 'status' in error) {
		return error.status as number;
	}
	return undefined;
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'Internal Server Error';
}

/**
 * Enhanced API error handler
 */
export async function handleApiError(error: unknown, event: any, metadata: { requestId: string; duration: number }) {
	const errorInfo = {
		requestId: metadata.requestId,
		url: event.node.req.url,
		method: event.node.req.method,
		duration: metadata.duration,
		timestamp: new Date().toISOString(),
		userAgent: event.node.req.headers['user-agent'],
		ip: getClientIP(event),
		statusCode: getErrorStatusCode(error),
		headers: event.node.req.headers
	};

	// Enhanced logging
	const isServerError = errorInfo.statusCode && errorInfo.statusCode >= 500;
	const logMessage = `${isServerError ? 'ERROR' : 'WARN'}: ${errorInfo.method} ${errorInfo.url}`;
	const logData = {
		requestId: errorInfo.requestId,
		statusCode: errorInfo.statusCode,
		duration: errorInfo.duration,
		error: error instanceof Error ? error.message : String(error)
	};

	isServerError ? useLogger('API').error(logMessage, logData) : useLogger('API').warn(logMessage, logData);
}


