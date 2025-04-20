export default function AuthMiddleware() {
	return defineRequestMiddleware(
		defineEventHandler(async (event) => {
			await requireUserSession(event, {
				statusCode: 401,
				message: 'Missing session'
			});
		})
	);
}
