import type { ExternalService } from "#server/utils/external-service";
import type { SocialSubscriptionBody } from "#shared/utils/social";
import { callExternalService } from "#server/utils/external-service";
import {
	SocialAddedSchema,
	SocialRemovedSchema,
	SocialStateSchema,
	SocialSwitchSchema,
} from "#shared/utils/social";

/**
 * Staryl's guild API, which holds the Social module's switch and
 * subscriptions (wolfstar-project/staryl, `docs/guild-api.md`). The secret is
 * Staryl's `GUILD_API_SECRET`: whoever holds it acts for every server, so a
 * route calls these only behind an `authorize` hook that checked the member.
 */
function staryl(): ExternalService {
	const { starylApiSecret, starylApiUrl } = useRuntimeConfig();
	return {
		name: "staryl",
		secret: starylApiSecret,
		url: starylApiUrl.replace(/\/+$/u, ""),
	};
}

/** The switch, the platforms and every subscription of a server. */
export function readSocialState(guildId: string, actorId: string) {
	return callExternalService(staryl(), {
		actorId,
		endpoint: "notifications.read",
		path: `/guilds/${guildId}/notifications`,
		schema: SocialStateSchema,
	});
}

/** Turns the server's notifications on or off. Off keeps every subscription. */
export function setSocialEnabled(guildId: string, actorId: string, enabled: boolean) {
	return callExternalService(staryl(), {
		actorId,
		body: { enabled },
		endpoint: "notifications.switch",
		method: "PATCH",
		path: `/guilds/${guildId}/notifications`,
		schema: SocialSwitchSchema,
	});
}

export function addSocialSubscription(
	guildId: string,
	actorId: string,
	body: SocialSubscriptionBody,
) {
	return callExternalService(staryl(), {
		actorId,
		body,
		endpoint: "subscriptions.add",
		method: "POST",
		path: `/guilds/${guildId}/subscriptions`,
		schema: SocialAddedSchema,
	});
}

export function removeSocialSubscription(
	guildId: string,
	actorId: string,
	channelId: string,
	sourceId: string,
) {
	return callExternalService(staryl(), {
		actorId,
		endpoint: "subscriptions.remove",
		method: "DELETE",
		path: `/guilds/${guildId}/subscriptions/${channelId}/${sourceId}`,
		schema: SocialRemovedSchema,
	});
}
