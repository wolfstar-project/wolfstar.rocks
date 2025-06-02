export default defineNuxtPlugin(async () => {
	const apiOrigin = getApiOrigin();
	const { handleApiError, handleNetworkError } = await useErrorHandler();

	const api = $fetch.create({
		baseURL: apiOrigin,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'X-Request-ID': crypto.randomUUID?.()
		},
		onRequestError({ error }) {
			// Handle network/connection errors
			handleNetworkError(error);
		},
		onResponseError({ request, response, error }) {
			// Log for debugging
			useLogger().error(error);

			// Handle API response errors with enhanced context
			const endpoint = typeof request === 'string' ? request : request.toString();
			const method = response?.headers?.get('') || 'GET';

			handleApiError(error, endpoint, method);
		}
	});

	return {
		provide: {
			api
		}
	};
});
