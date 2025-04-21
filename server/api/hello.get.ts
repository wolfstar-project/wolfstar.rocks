import rateLimitMiddleware from '../middlewares/ratelimit';

defineRouteMeta({
	openAPI: {
		tags: ['test'],
		description: 'Test route description',
		parameters: [{ in: 'query', name: 'test', required: false }]
	}
});

export default defineEventHandler({
	onRequest: [rateLimitMiddleware()],
	onBeforeResponse: () => {
		useLogger('wolfstar-debug').debug('hello world');
	},
	handler: (event) => {
		const query = getQuery(event);
		if (!query.test) {
			return 'GET: hello world';
		}
		return `GET: hello world with query test=${query.test}`;
	}
});
