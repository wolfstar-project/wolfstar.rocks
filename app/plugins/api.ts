export default defineNuxtPlugin(() => {
	const apiOrigin = getApiOrigin();

	const api = $fetch.create({
		baseURL: apiOrigin,
		credentials: 'include'
	});

	return {
		provide: {
			api
		}
	};
});
