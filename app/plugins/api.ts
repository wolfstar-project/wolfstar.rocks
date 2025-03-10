export default defineNuxtPlugin(() => {
	const apiOrigin = getApiOrigin();

	const api = $fetch.create({
		baseURL: apiOrigin,
		credentials: 'include',
		async onResponseError({ response }) {
			consola.error('API error', response);
		}
	});

	return {
		provide: {
			api
		}
	};
});
