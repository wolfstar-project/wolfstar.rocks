/**
 * What the server SDKs may collect. The server never set `sendDefaultPii`, so
 * Sentry 10 sent no user info or cookies from it. Sentry 11's `dataCollection`
 * defaults collect all of that, plus request bodies and database query data,
 * so every server SDK (Node and Worker) turns those off from here.
 */
export const SERVER_DATA_COLLECTION = {
	userInfo: false,
	cookies: false,
	httpBodies: [],
	databaseQueryData: false,
	queues: false,
};
