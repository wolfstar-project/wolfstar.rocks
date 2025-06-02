import { captureException, withScope } from '@sentry/nuxt';

export default defineEventHandler(async (event) => {
	// Solo per le route API
	if (!event.node.req.url?.startsWith('/api')) {
		return;
	}

	// Middleware per catturare errori automaticamente
	const originalEnd = event.node.res.end;
	let errorCaught = false;

	// Override del metodo end per catturare errori
	event.node.res.end = function (chunk?: any, encoding?: any, cb?: any) {
		if (!errorCaught && event.node.res.statusCode >= 400) {
			// Cattura errori HTTP automaticamente
			const errorInfo = {
				url: event.node.req.url,
				method: event.node.req.method,
				statusCode: event.node.res.statusCode,
				headers: event.node.req.headers,
				timestamp: new Date().toISOString(),
				userAgent: event.node.req.headers['user-agent'],
				ip: event.node.req.headers['x-forwarded-for'] || event.node.req.socket?.remoteAddress || 'unknown'
			};

			// Log per debugging
			console.error('API Error detected:', {
				status: event.node.res.statusCode,
				url: event.node.req.url,
				method: event.node.req.method
			});

			// Invia a Sentry solo errori 5xx (server errors)
			if (event.node.res.statusCode >= 500) {
				withScope((scope) => {
					scope.setContext('serverError', errorInfo);
					scope.setTag('errorType', 'server-api');
					scope.setTag('endpoint', event.node.req.url || 'unknown');
					scope.setTag('method', event.node.req.method || 'unknown');
					scope.setLevel('error');

					captureException(new Error(`Server Error ${event.node.res.statusCode}: ${event.node.req.url}`));
				});
			}

			errorCaught = true;
		}

		// Chiama il metodo originale
		return originalEnd.call(this, chunk, encoding, cb);
	};

	// Gestione errori non catturati nelle route
	try {
		// Il middleware continua l'esecuzione normale
	} catch (error) {
		errorCaught = true;

		const errorInfo = {
			url: event.node.req.url,
			method: event.node.req.method,
			headers: event.node.req.headers,
			timestamp: new Date().toISOString(),
			userAgent: event.node.req.headers['user-agent'],
			ip: event.node.req.headers['x-forwarded-for'] || event.node.req.socket?.remoteAddress || 'unknown',
			error: error instanceof Error ? error.message : String(error)
		};

		console.error('Uncaught API Error:', errorInfo);

		withScope((scope) => {
			scope.setContext('serverError', errorInfo);
			scope.setTag('errorType', 'uncaught-server-api');
			scope.setTag('endpoint', event.node.req.url || 'unknown');
			scope.setTag('method', event.node.req.method || 'unknown');

			captureException(error);
		});

		// Re-throw per permettere al handler di Nuxt di gestirlo
		throw error;
	}
});
