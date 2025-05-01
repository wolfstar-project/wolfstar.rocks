export default defineNuxtPlugin(() => {
	const apiOrigin = getApiOrigin();

	const api = $fetch.create({
		baseURL: apiOrigin,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		onResponseError(error) {
			useLogger().error(error);
		}
	});

	return {
		provide: {
			api
		}
	};
});
