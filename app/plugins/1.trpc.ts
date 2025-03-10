import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client';
import superjson from 'superjson';
import type { AppRouter } from '~~/server/trpc/routers/index';
import { loggerLink } from '@trpc/client';

export default defineNuxtPlugin(() => {
	const client = createTRPCNuxtClient<AppRouter>({
		links: [
			loggerLink({
				enabled: (opts) =>
					(process.env.NODE_ENV === 'development' && typeof window !== 'undefined') ||
					(opts.direction === 'down' && opts.result instanceof Error)
			}),
			httpBatchLink({
				url: '/api/trpc',
				transformer: superjson,
				fetch(url, options) {
					return fetch(url, {
						...options,
						credentials: 'include'
					});
				}
			})
		]
	});

	return {
		provide: {
			client
		}
	};
});
