import type {
	SocialProviderName,
	SocialState,
	SocialSubscription,
	SocialSubscriptionBody,
} from "#shared/utils/social";
import type { LogsPillTone } from "~/components/guild/logs/Pill.vue";

/** The mark of each platform. Written out in full, so the icon scanner finds them. */
export const SOCIAL_PROVIDER_ICONS: Record<SocialProviderName, string> = {
	Bluesky: "simple-icons:bluesky",
	Instagram: "simple-icons:instagram",
	Mastodon: "simple-icons:mastodon",
	Reddit: "simple-icons:reddit",
	Rss: "simple-icons:rss",
	TikTok: "simple-icons:tiktok",
	TwitchClips: "simple-icons:twitch",
	TwitchVideos: "simple-icons:twitch",
	X: "simple-icons:x",
	YouTube: "simple-icons:youtube",
};

/** What the add dialog holds while it is filled in. */
export interface SocialDraft {
	provider: SocialProviderName | null;
	target: string;
	channelId: string | null;
	message: string;
}

export function emptySocialDraft(): SocialDraft {
	return { channelId: null, message: "", provider: null, target: "" };
}

/**
 * The platforms the add dialog offers: the ones Staryl has credentials for
 * and lets the dashboard change. An account its owner has to connect starts in
 * Discord, and a platform without credentials would refuse every target.
 */
export function addableSocialProviders(state: SocialState): SocialProviderName[] {
	return state.providers
		.filter((provider) => provider.configured && provider.manageable)
		.map((provider) => provider.name);
}

/**
 * What keeps the draft from being sent: the server already has as many
 * subscriptions as it may, or a field the request needs is still empty.
 */
export type SocialDraftProblem = "limit" | "incomplete";

export function socialDraftProblem(
	draft: SocialDraft,
	state: SocialState,
): SocialDraftProblem | null {
	if (state.subscriptions.length >= state.limits.subscriptions) return "limit";
	if (draft.provider === null || draft.target.trim() === "" || draft.channelId === null) {
		return "incomplete";
	}
	return null;
}

/** The body of the add request. Call it only for a draft without a problem. */
export function socialDraftBody(draft: SocialDraft): SocialSubscriptionBody | null {
	if (draft.provider === null || draft.channelId === null) return null;
	return {
		channelId: draft.channelId,
		message: draft.message.trim() || null,
		provider: draft.provider,
		target: draft.target.trim(),
	};
}

/**
 * How a subscription is doing, as one word and a tone. A notification that did
 * not reach its channel comes first: the account can be fine while nothing is
 * posted, and that is what an admin has to fix.
 */
export function socialSubscriptionStatus(subscription: SocialSubscription): {
	key: string;
	tone: LogsPillTone;
} {
	if (subscription.deliveryError) {
		return {
			key: `guild_settings.social.delivery_errors.${subscription.deliveryError}`,
			tone: "error",
		};
	}
	const tones: Record<SocialSubscription["health"], LogsPillTone> = {
		active: "success",
		authFailed: "error",
		failing: "warning",
		rateLimited: "warning",
		targetUnavailable: "error",
		unavailable: "neutral",
	};
	return {
		key: `guild_settings.social.health.${subscription.health}`,
		tone: tones[subscription.health],
	};
}
