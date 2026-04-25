import { resolveActor } from "#server/utils/audit/actor-bridge";
import { auditEnricher } from "evlog";
import { createUserAgentEnricher, createTraceContextEnricher } from "evlog/enrichers";

export default defineNitroPlugin((nitroApp) => {
	const enrichers = [
		createUserAgentEnricher(),
		createTraceContextEnricher(),
		auditEnricher({
			tenantId: (ctx) =>
				(ctx as { event?: { guild?: { id?: string } } }).event?.guild?.id ?? undefined,
			bridge: { getSession: resolveActor },
		}),
	];

	nitroApp.hooks.hook("evlog:enrich", (ctx) => {
		for (const enricher of enrichers) {
			enricher(ctx);
		}
	});
});
