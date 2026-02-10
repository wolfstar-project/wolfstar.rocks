defineRouteMeta({
	openAPI: {
		description: "A simple health check endpoint to verify the API is running correctly.",
		operationId: "healthCheck",
		parameters: [
			{
				description: "Optional test parameter to echo back in the response",
				in: "query",
				name: "test",
				required: false,
				schema: { type: "string" },
			},
		],
		responses: {
			200: {
				content: {
					"application/json": {
						schema: {
							properties: {
								message: { description: "Health check response message", example: "hello world", type: "string" },
							},
							required: ["message"],
							type: "object",
						},
					},
				},
				description: "API is healthy and responding",
			},
		},
		summary: "API health check",
		tags: ["General"],
	},
});

export default defineEventHandler((event) => {
	const query = getQuery(event);
	if (!query.test) {
		return { message: "hello world" };
	}
	return { message: `GET: hello world with query test=${query.test}` };
});
