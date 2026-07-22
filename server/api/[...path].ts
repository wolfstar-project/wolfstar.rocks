import { fetchBotApi, isPublicBotApiPath } from "#server/utils/botApi";
import { createError, useLogger } from "evlog";
import { getQuery, readBody } from "h3";

type BotHttpMethod = "GET" | "PATCH" | "POST" | "PUT" | "DELETE";

/**
 * Same-origin BFF for `$api` on the client.
 * Forwards `/api/**` (except `/api/auth/**`) to the WolfStar bot API with
 * sapphire auth when needed.
 *
 * The browser cannot set a cross-origin `SAPPHIRE_AUTH` Cookie header toward
 * `localhost:8282` / `api.wolfstar.rocks`; this proxy injects it server-side
 * from the better-auth Discord session.
 *
 * Auth routes under `/api/auth/**` are owned by better-auth / `auth/refresh`
 * and take precedence over this catch-all.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const pathParam = getRouterParam(event, "path");
		if (!pathParam) {
			throw createError({
				message: "Not found",
				status: 404,
				why: "Bot API proxy path is empty",
			});
		}

		const path = pathParam.startsWith("/") ? pathParam : `/${pathParam}`;
		if (path === "/auth" || path.startsWith("/auth/")) {
			throw createError({
				message: "Not found",
				status: 404,
				why: "Auth routes are not proxied to the bot API",
			});
		}

		const method = (event.method || "GET").toUpperCase() as BotHttpMethod;
		log.set({ botApi: { path, method } });

		const query = getQuery(event);
		const body = method === "GET" || method === "DELETE" ? undefined : await readBody(event);

		return await fetchBotApi(event, path, {
			auth: !isPublicBotApiPath(path),
			body,
			method,
			query,
		});
	},
	{
		auth: false,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 30, type: "fixed", window: 10_000 },
	},
);
