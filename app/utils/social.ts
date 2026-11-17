import type {
	SocialProviderName,
	SocialState,
	SocialSubscription,
	SocialSubscriptionBody,
	SocialTwitchBody,
	SocialTwitchEvent,
} from "#shared/utils/social";
import type { LogsPillTone } from "~/components/guild/logs/Pill.vue";

/** The mark of each platform. Written out in full, so the icon scanner finds them. */
export const SOCIAL_PROVIDER_ICONS: Record<SocialSource, string> = {
	Bluesky: "simple-icons:bluesky",
	Instagram: "simple-icons:instagram",
	Mastodon: "simple-icons:mastodon",
	Reddit: "simple-icons:reddit",
	Rss: "simple-icons:rss",
	TikTok: "simple-icons:tiktok",
	TwitchLive: "simple-icons:twitch",
	TwitchClips: "simple-icons:twitch",
	TwitchVideos: "simple-icons:twitch",
	X: "simple-icons:x",
	YouTube: "simple-icons:youtube",
};

/**
 * What the add dialog follows: a platform of Staryl's social providers, or
 * Twitch live, which Staryl keeps apart because Twitch pushes it through EventSub.
 */
export type SocialSource = SocialProviderName | "TwitchLive";

/** What the add dialog holds while it is filled in. */
export interface SocialDraft {
	source: SocialSource | null;
	target: string;
	channelId: string | null;
	message: string;
	/** For Twitch live: whether the notification is posted as the stream starts or ends. */
	event: SocialTwitchEvent;
}

export function emptySocialDraft(): SocialDraft {
	return { channelId: null, event: "StreamOnline", message: "", source: null, target: "" };
}

/**
 * How much of a source the server uses: its subscriptions, and how many it
 * may have. `maximum` is `null` when Staryl does not say, as an older Staryl
 * does for Twitch live; such a source is not held to a number here.
 */
export interface SocialSourceUsage {
	used: number;
	maximum: number | null;
}

export function socialSourceUsage(state: SocialState, source: SocialSource): SocialSourceUsage {
	if (source === "TwitchLive") {
		return { maximum: state.limits.twitchLive ?? null, used: state.twitch.length };
	}
	const maximum = state.providers.find((entry) => entry.name === source)?.maximum;
	// An older Staryl gives no maximum per platform, only one total every platform shares: each
	// counts every subscription against it, so all of them are full together.
	if (maximum === undefined) {
		return { maximum: state.limits.subscriptions, used: state.subscriptions.length };
	}
	return {
		maximum,
		used: state.subscriptions.filter((subscription) => subscription.provider === source).length,
	};
}

function isFull({ used, maximum }: SocialSourceUsage): boolean {
	return maximum !== null && used >= maximum;
}

/** A source the add dialog lists, how much of it is used, and whether it can be picked. */
export interface SocialSourceOption {
	source: SocialSource;
	usage: SocialSourceUsage;
	/** Why it cannot be picked: Staryl has no credentials for it, or the server has its maximum. */
	blocked: "unavailable" | "full" | null;
}

/**
 * Every source the add dialog lists, Twitch live first. An account its owner
 * has to connect (Instagram, TikTok) starts in Discord, so it is left out. A
 * source Staryl has no credentials for, or one the server has its maximum of,
 * is listed but blocked, so an admin sees it and why it cannot be picked.
 */
export function socialSourceOptions(state: SocialState): SocialSourceOption[] {
	const sources: { source: SocialSource; configured: boolean }[] = [
		{ configured: state.twitchLiveConfigured, source: "TwitchLive" },
		...state.providers
			.filter((provider) => provider.manageable)
			.map((provider) => ({ configured: provider.configured, source: provider.name })),
	];
	return sources.map(({ configured, source }) => {
		const usage = socialSourceUsage(state, source);
		return {
			blocked: !configured ? "unavailable" : isFull(usage) ? "full" : null,
			source,
			usage,
		};
	});
}

/** Whether the add dialog has anything to offer: one source can be picked. */
export function canAddToSocial(state: SocialState): boolean {
	return socialSourceOptions(state).some((option) => option.blocked === null);
}

/**
 * What keeps the draft from being sent: the server has its maximum of the
 * source, an offline notification has no message, or a field the request
 * needs is still empty.
 */
export type SocialDraftProblem = "limit" | "message" | "incomplete";

export function socialDraftProblem(
	draft: SocialDraft,
	state: SocialState,
): SocialDraftProblem | null {
	if (draft.source !== null && isFull(socialSourceUsage(state, draft.source))) return "limit";
	if (draft.source === null || draft.target.trim() === "" || draft.channelId === null) {
		return "incomplete";
	}
	if (
		draft.source === "TwitchLive" &&
		draft.event === "StreamOffline" &&
		draft.message.trim() === ""
	) {
		return "message";
	}
	return null;
}

/** The request the draft makes, to the route of its kind. */
export type SocialDraftRequest =
	| { kind: "social"; body: SocialSubscriptionBody }
	| { kind: "twitch"; body: SocialTwitchBody };

/** The request of the add dialog. Call it only for a draft without a problem. */
export function socialDraftRequest(draft: SocialDraft): SocialDraftRequest | null {
	if (draft.source === null || draft.channelId === null) return null;
	const message = draft.message.trim() || null;
	if (draft.source === "TwitchLive") {
		return {
			body: {
				channelId: draft.channelId,
				message,
				streamer: draft.target.trim(),
				type: draft.event,
			},
			kind: "twitch",
		};
	}
	return {
		body: {
			channelId: draft.channelId,
			message,
			provider: draft.source,
			target: draft.target.trim(),
		},
		kind: "social",
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
