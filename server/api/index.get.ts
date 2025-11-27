defineRouteMeta({
  openAPI: {
    tags: ["General"],
    summary: "API health check",
    description: "A simple health check endpoint to verify the API is running correctly.",
    operationId: "healthCheck",
    parameters: [
      {
        in: "query",
        name: "test",
        required: false,
        description: "Optional test parameter to echo back in the response",
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "API is healthy and responding",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", description: "Health check response message", example: "hello world" },
              },
              required: ["message"],
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler((event) => {
  const query = getQuery(event);
  if (!query.test) {
    return { message: "hello world" };
  }
  return { message: `GET: hello world with query test=${query.test}` };
});
