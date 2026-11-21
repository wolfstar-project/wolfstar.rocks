import { resolveActor } from "#server/utils/audit/actor-bridge";
import { auditEnricher } from "evlog";
import { createUserAgentEnricher, createTraceContextEnricher } from "evlog/enrichers";

export default defineNitroPlugin((nitroApp) => {
	const enrichers = [
		createUserAgentEnricher(),
		createTraceContextEnricher(),
		auditEnricher({
			tenantId: (ctx) => {
				if (ctx.event.audit?.target?.type === "guild") {
					return ctx.event.audit.target.id;
				}
				const match = ctx.request?.path?.match(/\/guilds\/(\d+)/);
				return match?.[1];
			},
			bridge: { getSession: resolveActor },
		}),
	];

	nitroApp.hooks.hook("evlog:enrich", (ctx) => {
		for (const enricher of enrichers) {
			enricher(ctx);
		}
	});
});
