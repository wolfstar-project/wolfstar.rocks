import type { MaybeRefOrGetter } from "vue";
import { toComponentEmbedJson } from "discord-component-embed";
import { buildDiscordLinkCard, type DiscordLinkCardOptions } from "~/utils/discord-component-embed";

/**
 * Registers the `discord:component-embed` script Discord's crawler reads to
 * render a Components v2 card for this page's link. The tag is written on the
 * server only: crawlers never run client JS, and prerendered pages already
 * ship it in their HTML.
 */
export function useDiscordLinkCard(options: MaybeRefOrGetter<DiscordLinkCardOptions>) {
	if (!import.meta.server) return;

	useHead({
		script: [
			{
				id: "discord:component-embed",
				innerHTML: () => toComponentEmbedJson(buildDiscordLinkCard(toValue(options))),
				type: "application/json",
			},
		],
	});
}
