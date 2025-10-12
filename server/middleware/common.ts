import { useLogger } from "#shared/utils/logger";
import { getRequestURL } from "h3";

const logger = useLogger("middleware:common");

export default defineEventHandler(async (event) => {
  const start = performance.now();

  const { req, res } = event.node;
  const logAccess = (kind: "finish" | "close") => {
    const duration = Math.round(performance.now() - start);
    const statusCode = res.statusCode;
    const method = req.method;
    const u = getRequestURL(event);

    const safeUrl = u.pathname + (u.search || "");
    const timestamp = new Date().toISOString();
    logger.info(`[${timestamp}] ${method} ${safeUrl} ${statusCode} - ${duration}ms (${kind})`);
  };
  res.on("finish", () => logAccess("finish"));
  // Also capture aborted connections
  res.on("close", () => logAccess("close"));
});
