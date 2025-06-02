import type { User } from '@sentry/core';
import { captureException, captureMessage, withScope } from '@sentry/nuxt';
import { H3Error } from 'h3';
import { toast } from 'vue-sonner';
import { getEnv } from '~/config/env';

export interface ErrorContext {
	userId?: string;
	sessionId?: string;
	route?: string;
	userAgent?: string;
	timestamp?: string;
	[key: string]: any;
}

export interface ErrorHandlerOptions {
	showToast?: boolean;
	logToConsole?: boolean;
	captureToSentry?: boolean;
	level?: 'error' | 'warning' | 'info';
	tags?: Record<string, string>;
	fingerprint?: string[];
	context?: ErrorContext;
}

export async function useErrorHandler() {
	const nuxtApp = useNuxtApp();
	const route = useRoute();
	const { user } = await useAuth();

	/**
	 * Enhanced error context with user and application data
	 */
	function getErrorContext(): ErrorContext {
		return {
			route: route.fullPath,
			timestamp: new Date().toISOString(),
			userAgent: import.meta.client ? navigator.userAgent : undefined,
			userId: user?.value?.id ?? undefined,
			ssrContext: nuxtApp.ssrContext
				? {
						url: nuxtApp.ssrContext.url,
						statusCode: nuxtApp.ssrContext.event?.node?.res?.statusCode
					}
				: undefined,
			commit: getEnv().then((env) => env.commit),
			shortCommit: getEnv().then((env) => env.shortCommit),
			branch: getEnv().then((env) => env.branch),
			environment: useRuntimeConfig().public.environment
		};
	}

	/**
	 * Set user context for Sentry
	 */
	function setSentryUser(user: User) {
		withScope((scope) => {
			scope.setUser(user);
		});
	}

	/**
	 * Main error handler with Sentry integration
	 */
	function handleError(error: unknown, options: ErrorHandlerOptions = {}): void {
		const { showToast = false, logToConsole = true, captureToSentry = true, level = 'error', tags = {}, fingerprint, context = {} } = options;

		// Normalize error
		const normalizedError = normalizeError(error);

		// Enhanced context
		const errorContext = {
			...getErrorContext(),
			...context
		};

		// Console logging
		if (logToConsole) {
			useLogger().error(`Error handled: ${normalizedError.message}`);
		}

		// Sentry capture
		if (captureToSentry) {
			withScope((scope) => {
				// Set context
				scope.setContext('errorHandler', errorContext);

				// Set tags
				Object.entries(tags).forEach(([key, value]) => {
					scope.setTag(key, value);
				});

				// Set fingerprint for error grouping
				if (fingerprint) {
					scope.setFingerprint(fingerprint);
				}

				// Set level
				scope.setLevel(level);

				// Capture based on error type
				if (normalizedError instanceof Error) {
					captureException(normalizedError);
				} else {
					captureMessage(String(normalizedError), level);
				}
			});
		}

		// Show toast notification
		if (showToast && import.meta.client) {
			const message = getErrorMessage(normalizedError);
			toast.error(message, {
				description: 'An unexpected error occurred. Please try again later.'
			});
		}
	}

	/**
	 * Handle Vue errors specifically
	 */
	function handleVueError(error: unknown, instance: any, info: string): void {
		handleError(error, {
			captureToSentry: true,
			logToConsole: true,
			tags: {
				errorType: 'vue',
				errorInfo: info,
				component: instance?.$options.name || 'unknown'
			},
			context: {
				componentName: instance?.$options.name,
				errorInfo: info,
				propsData: instance?.$props
			}
		});
	}

	/**
	 * Handle async data errors
	 */
	function handleAsyncError(error: unknown, key?: string): void {
		handleError(error, {
			captureToSentry: true,
			logToConsole: true,
			showToast: true,
			tags: {
				errorType: 'async-data',
				asyncKey: key || 'unknown'
			},
			context: {
				asyncDataKey: key
			}
		});
	}

	/**
	 * Handle API errors
	 */
	function handleApiError(error: unknown, endpoint?: string, method?: string): void {
		const normalizedError = normalizeError(error);

		handleError(normalizedError, {
			captureToSentry: true,
			logToConsole: true,
			showToast: true,
			tags: {
				errorType: 'api',
				endpoint: endpoint || 'unknown',
				method: method || 'unknown'
			},
			context: {
				apiEndpoint: endpoint,
				httpMethod: method,
				statusCode: getErrorStatusCode(normalizedError)
			}
		});
	}

	/**
	 * Handle form validation errors
	 */
	function handleFormError(error: unknown, formId?: string): void {
		// Don't send validation errors to Sentry unless they're unexpected
		const isValidationError = error instanceof Error && error.message.includes('validation');

		handleError(error, {
			captureToSentry: !isValidationError,
			logToConsole: true,
			showToast: true,
			level: isValidationError ? 'warning' : 'error',
			tags: {
				errorType: 'form',
				formId: formId || 'unknown'
			},
			context: {
				formIdentifier: formId
			}
		});
	}

	/**
	 * Handle network errors
	 */
	function handleNetworkError(error: unknown): void {
		handleError(error, {
			captureToSentry: true,
			logToConsole: true,
			showToast: true,
			tags: {
				errorType: 'network'
			},
			fingerprint: ['network-error'], // Group network errors together
			context: {
				connectionType: import.meta.client ? (navigator as any)?.connection?.effectiveType : undefined,
				online: import.meta.client ? navigator.onLine : undefined
			}
		});
	}

	return {
		handleError,
		handleVueError,
		handleAsyncError,
		handleApiError,
		handleFormError,
		handleNetworkError,
		setSentryUser,
		getErrorContext
	};
}

/**
 * Normalize different error types
 */
function normalizeError(error: unknown): H3Error {
	if (error instanceof H3Error) {
		return error;
	}

	if (typeof error === 'string') {
		return new H3Error(error);
	}

	if (error && typeof error === 'object') {
		return new H3Error(JSON.stringify(error));
	}

	return new H3Error('Unknown error occurred');
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof H3Error) {
		// Don't expose sensitive error details to users
		if (error.message.includes('fetch')) {
			return 'Network error occurred. Please try again.';
		}
		if (error.message.includes('validation')) {
			return 'Please check your input and try again.';
		}
		return error.message;
	}

	return 'An unexpected error occurred';
}

/**
 * Extract status code from error
 */
function getErrorStatusCode(error: H3Error): number | undefined {
	if (error && typeof error === 'object' && 'statusCode' in error) {
		return error.statusCode;
	}
	return undefined;
}
