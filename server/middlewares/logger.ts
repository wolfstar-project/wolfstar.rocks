export default defineEventHandler(async (event) => {
	useLogger().info(`
    Path: ${getRequestURL(event)} :${event.node.req.method}
    IP: ${event.node.req.headers['x-forwarded-for'] || event.node.req.socket.remoteAddress}
    User-Agent: ${event.node.req.headers['user-agent']}  
    Content-Type: ${event.node.req.headers['content-type']}
    Accept: ${event.node.req.headers['accept']}
    Query: ${JSON.stringify(getQuery(event))}
    
    `);
});
