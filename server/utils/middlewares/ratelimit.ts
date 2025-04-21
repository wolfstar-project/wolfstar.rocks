import { RateLimitManager } from '@sapphire/ratelimits';
import type { EventHandlerRequest, H3Event } from 'h3';

interface RateLimitOptions {
	time?: number;
	max?: number;
	message?: (event: H3Event) => string;
	auth?: boolean;
}

export default async function defineRateLimitMiddleware<T extends EventHandlerRequest>(
	event: H3Event<T>,
	options: RateLimitOptions = {
		time: 5,
		max: 10,
		message: (event) =>
			`Rate limit exceeded. Please try again later. IP address: ${getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress}`,
		auth: false
	}
) {
	if (!options.time || !options.max) {
		throw new Error('Rate limit time and max must be defined');
	}
	const manager = new RateLimitManager(options.time, options.max);
	const xRateLimitLimit = options.time;

	useLogger('wolfstar-debug').debug('Rate limit handler executed');

	const auth = options.auth;
	const id = (auth ? (await getUserSession(event)).id : getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress) as string;

	const bucket = manager.acquire(id);
	setHeader(event, 'Date', new Date().toUTCString());

	if (bucket.limited) {
		setHeader(event, 'Retry-After', bucket.remainingTime);
		const message = options.message instanceof Function ? options.message(event) : options.message;

		throw createError({
			statusCode: 429,
			statusMessage: 'Too Many Requests',
			message
		});
	}
	try {
		bucket.consume();
	} catch {
		/* empty */
	}
	setHeader(event, 'X-RateLimit-Limit', xRateLimitLimit.toString());
	setHeader(event, 'X-RateLimit-Remaining', bucket.remaining.toString());
	setHeader(event, 'X-RateLimit-Reset', bucket.remainingTime.toString());
}
