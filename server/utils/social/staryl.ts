import type { ExternalService } from "#server/utils/external-service";
import type {
	SocialEditBody,
	SocialSubscriptionBody,
	SocialTwitchBody,
} from "#shared/utils/social";
import { callExternalService } from "#server/utils/external-service";
import {
	SocialAddedSchema,
	SocialEditedSchema,
	SocialRemovedSchema,
	SocialStateSchema,
	SocialSwitchSchema,
	SocialTargetSuggestionsSchema,
	SocialTwitchAddedSchema,
	SocialTwitchEditedSchema,
	SocialTwitchRemovedSchema,
} from "#shared/utils/social";
import { useRuntimeConfig } from "nuxt/server";

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

/** Moves a subscription to another channel, or changes its message. The account stays. */
export function editSocialSubscription(
	guildId: string,
	actorId: string,
	key: { channelId: string; sourceId: string },
	body: SocialEditBody,
) {
	return callExternalService(staryl(), {
		actorId,
		body,
		endpoint: "subscriptions.edit",
		method: "PATCH",
		path: `/guilds/${guildId}/subscriptions/${key.channelId}/${key.sourceId}`,
		schema: SocialEditedSchema,
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

/** Notifies a channel when a streamer goes live or offline, through Twitch's EventSub. */
export function addSocialTwitch(guildId: string, actorId: string, body: SocialTwitchBody) {
	return callExternalService(staryl(), {
		actorId,
		body,
		endpoint: "twitch.add",
		method: "POST",
		path: `/guilds/${guildId}/twitch`,
		schema: SocialTwitchAddedSchema,
	});
}

/** Moves a Twitch live notification to another channel, or changes its message. */
export function editSocialTwitch(
	guildId: string,
	actorId: string,
	key: { channelId: string; subscriptionId: string },
	body: SocialEditBody,
) {
	return callExternalService(staryl(), {
		actorId,
		body,
		endpoint: "twitch.edit",
		method: "PATCH",
		path: `/guilds/${guildId}/twitch/${key.channelId}/${key.subscriptionId}`,
		schema: SocialTwitchEditedSchema,
	});
}

export function removeSocialTwitch(
	guildId: string,
	actorId: string,
	channelId: string,
	subscriptionId: string,
) {
	return callExternalService(staryl(), {
		actorId,
		endpoint: "twitch.remove",
		method: "DELETE",
		path: `/guilds/${guildId}/twitch/${channelId}/${subscriptionId}`,
		schema: SocialTwitchRemovedSchema,
	});
}

/** Accounts that match what a member is typing, as the autocomplete of `/subscriptions` offers them. */
export function searchSocialTargets(
	guildId: string,
	actorId: string,
	source: string,
	query: string,
) {
	const params = new URLSearchParams({ query, source });
	return callExternalService(staryl(), {
		actorId,
		endpoint: "targets.search",
		path: `/guilds/${guildId}/targets?${params}`,
		schema: SocialTargetSuggestionsSchema,
	});
}
