import { createUserAgentEnricher, createTraceContextEnricher } from "evlog/enrichers";

export default defineNitroPlugin((nitroApp) => {
	const enrichers = [createUserAgentEnricher(), createTraceContextEnricher()];

	nitroApp.hooks.hook("evlog:enrich", (ctx) => {
		for (const enricher of enrichers) {
			enricher(ctx);
		}
	});
});
