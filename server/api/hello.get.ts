import rateLimitMiddleware from '../middlewares/ratelimit';

export default defineEventHandler({
	onRequest: [rateLimitMiddleware()],
	onBeforeResponse: () => {
		useLogger('wolfstar-debug').debug('hello world');
	},
	handler: () => 'GET: hello world'
});
