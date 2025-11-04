import { useLogger } from "#shared/utils/logger";
import { getRequestURL } from "h3";

const logger = useLogger("middleware:common");

export default defineEventHandler(async (event) => {
  const start = performance.now();

  const { req, res } = event.node;
  const logAccess = () => {
    const duration = Math.round(performance.now() - start);
    const statusCode = res.statusCode;
    const method = req.method;
    const u = getRequestURL(event);

    const safeUrl = `${u.pathname}${u.search ? `${u.search.replace(/&/g, "&amp;")}` : ""}`;
    const timestamp = new Date().toISOString();
    logger.info(`[${timestamp}] ${method} ${safeUrl} ${statusCode} - ${duration}ms`);
  };
  res.on("finish", logAccess);
});
