import type { H3Event } from 'h3';
import { captureException } from '@sentry/nuxt';

/**
 * Get client IP safely
 */
export function getClientIP(event: H3Event): string {
	const forwarded = event.node.req.headers['x-forwarded-for'];
	if (forwarded) 
return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];

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
	const logMessage = `API ${isServerError ? 'ERROR' : 'WARN'}: ${errorInfo.method} ${errorInfo.url}`;
	const logData = {
		requestId: errorInfo.requestId,
		statusCode: errorInfo.statusCode,
		duration: errorInfo.duration,
		error: error instanceof Error ? error.message : String(error)
	};

	if (isServerError) {
		useLogger().error(logMessage, logData);
	} else {
		useLogger().warn(logMessage, logData);
	}

	// Send to Sentry with enhanced context
	if (shouldSendToSentry(errorInfo.statusCode)) {
		await sendToSentry(error, errorInfo);
	}
}

/**
 * Determine if error should be sent to Sentry
 */
export function shouldSendToSentry(statusCode?: number): boolean {
	if (!statusCode) 
return true;

	// Send 5xx errors (server errors)
	if (statusCode >= 500) 
return true;

	// Send 4xx errors that are likely application issues
	const criticalClientErrors = [401, 403, 422, 429];
	if (criticalClientErrors.includes(statusCode)) 
return true;

	return false;
}

/**
 * Send error to Sentry with proper context
 */
async function sendToSentry(error: unknown, errorInfo: any) {
	withScope((scope) => {
		// Set context
		scope.setContext('apiError', errorInfo);
		scope.setContext('request', {
			url: errorInfo.url,
			method: errorInfo.method,
			duration: errorInfo.duration,
			userAgent: errorInfo.userAgent
		});

		// Set tags for better filtering
		scope.setTag('errorType', 'api-middleware');
		scope.setTag('endpoint', errorInfo.url);
		scope.setTag('method', errorInfo.method);
		scope.setTag('statusCode', String(errorInfo.statusCode));
		scope.setTag('requestId', errorInfo.requestId);

		// Set level based on status code
		if (errorInfo.statusCode >= 500) {
			scope.setLevel('error');
		} else if (errorInfo.statusCode >= 400) {
			scope.setLevel('warning');
		} else {
			scope.setLevel('info');
		}

		// Set fingerprint for better grouping
		const fingerprint = ['api-error', errorInfo.method, errorInfo.url, String(errorInfo.statusCode)];
		scope.setFingerprint(fingerprint);

		// Capture the exception
		captureException(error);
	});
}
