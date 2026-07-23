export default defineWrappedResponseHandler(
	async (event) => {
		await refreshSessionTokens(event);
	},
	{
		auth: false,
		rateLimit: { enabled: true, limit: 3, window: seconds(5) },
	},
);
