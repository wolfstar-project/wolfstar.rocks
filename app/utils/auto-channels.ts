import type { AutoChannelSlug } from "~/composables/useAutoChannels";
import {
	AUTO_DELETE_DELAY,
	AUTO_MESSAGE_INTERVAL,
	AUTO_PURGE_INTERVAL,
	AUTO_PURGE_VALUE_FILTERS,
	MAXIMUM_AUTO_DELETES,
	MAXIMUM_AUTO_MESSAGE_LENGTH,
	MAXIMUM_AUTO_MESSAGES,
	MAXIMUM_AUTO_PURGE_VALUE_LENGTH,
	MAXIMUM_AUTO_PURGES,
	type AutoDeleteAllowKind,
	type AutoPurgeFilter,
} from "#shared/utils/auto-channels";

/** The most rows each table holds for a server. */
export const AUTO_CHANNEL_MAXIMUMS: Record<AutoChannelSlug, number> = {
	autodelete: MAXIMUM_AUTO_DELETES,
	automessage: MAXIMUM_AUTO_MESSAGES,
	autopurge: MAXIMUM_AUTO_PURGES,
};

const UNITS = [
	["day", 86_400],
	["hour", 3600],
	["minute", 60],
	["second", 1],
] as const;

/** The largest unit that holds `seconds` as a whole number, and how many of it. */
function wholeUnit(seconds: number) {
	for (const [unit, size] of UNITS) {
		if (seconds % size === 0) return { amount: seconds / size, unit };
	}
	return { amount: seconds, unit: "second" as const };
}

/** `43200` as "12 hours", in `locale`; the forms Auto-Message and the editor show. */
export function spellSeconds(seconds: number, locale: string): string {
	const { amount, unit } = wholeUnit(seconds);
	return new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "long" }).format(
		amount,
	);
}

/** `43200` as "12h", in `locale`; the form the tables show. */
export function compactSeconds(seconds: number, locale: string): string {
	const { amount, unit } = wholeUnit(seconds);
	return new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "narrow" }).format(
		amount,
	);
}

/** When a schedule runs next, from `now`: "in 3 hours", "tomorrow". */
export function formatNextRun(iso: string, now: Date, locale: string): string {
	const seconds = Math.round((Date.parse(iso) - now.getTime()) / 1000);
	const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
	const absolute = Math.abs(seconds);
	if (absolute < 60) return format.format(Math.max(0, seconds), "second");
	if (absolute < 3600) return format.format(Math.round(seconds / 60), "minute");
	if (absolute < 86_400) return format.format(Math.round(seconds / 3600), "hour");
	return format.format(Math.round(seconds / 86_400), "day");
}

/** The kind of value an Auto-Purge filter needs, or `null`. */
export function autoPurgeValueKind(filter: AutoPurgeFilter): "text" | "user" | null {
	return (
		(AUTO_PURGE_VALUE_FILTERS as Partial<Record<AutoPurgeFilter, "text" | "user">>)[filter] ??
		null
	);
}

/** What the editor holds while an admin fills it in, the same for the three tables. */
export interface AutoChannelDraft {
	channelId: string | null;
	/** Auto-Delete: seconds. */
	delay: number;
	allow: AutoDeleteAllowKind[];
	bots: boolean;
	/** Auto-Purge and Auto-Message: seconds. */
	interval: number;
	filter: AutoPurgeFilter;
	value: string;
	content: string;
	mentions: boolean;
}

/** A new draft, at the values the design starts with: at once, every day, every message. */
export function emptyAutoChannelDraft(): AutoChannelDraft {
	return {
		allow: [],
		bots: false,
		channelId: null,
		content: "",
		delay: 0,
		filter: "any",
		interval: 86_400,
		mentions: false,
		value: "",
	};
}

/** Why a draft cannot be saved yet, the first rule it breaks, as an i18n key with its values. */
export interface AutoChannelDraftProblem {
	key: string;
	values?: Record<string, string | number>;
}

/**
 * The first rule a draft breaks, in the order the editor asks for them, or
 * `null` when it can be saved. The server checks the same limits.
 *
 * @param taken The channels another row of the same table already has.
 */
export function autoChannelDraftProblem(
	slug: AutoChannelSlug,
	draft: AutoChannelDraft,
	taken: readonly string[],
): AutoChannelDraftProblem | null {
	if (!draft.channelId) return { key: "guild_settings.auto.errors.channel" };
	if (taken.includes(draft.channelId)) return { key: "guild_settings.auto.errors.channel_taken" };

	if (slug === "autodelete") {
		if (draft.delay > AUTO_DELETE_DELAY.maximum) {
			return { key: "guild_settings.auto.errors.delay" };
		}
		return null;
	}

	if (slug === "autopurge") {
		if (
			draft.interval < AUTO_PURGE_INTERVAL.minimum ||
			draft.interval > AUTO_PURGE_INTERVAL.maximum
		) {
			return { key: "guild_settings.auto.errors.purge_interval" };
		}
		const kind = autoPurgeValueKind(draft.filter);
		if (kind !== null && draft.value.trim() === "") {
			return { key: `guild_settings.auto.errors.needs_${kind}` };
		}
		if (kind === "text" && draft.value.trim().length > MAXIMUM_AUTO_PURGE_VALUE_LENGTH) {
			return {
				key: "guild_settings.auto.errors.value_length",
				values: { maximum: MAXIMUM_AUTO_PURGE_VALUE_LENGTH },
			};
		}
		return null;
	}

	if (draft.content.trim() === "") return { key: "guild_settings.auto.errors.content" };
	if (draft.content.length > MAXIMUM_AUTO_MESSAGE_LENGTH) {
		return {
			key: "guild_settings.auto.errors.content_length",
			values: { maximum: MAXIMUM_AUTO_MESSAGE_LENGTH },
		};
	}
	if (
		draft.interval < AUTO_MESSAGE_INTERVAL.minimum ||
		draft.interval > AUTO_MESSAGE_INTERVAL.maximum
	) {
		return { key: "guild_settings.auto.errors.message_interval" };
	}
	return null;
}

/** The body the route of `slug` takes for a draft the editor accepted. */
export function autoChannelBody(slug: AutoChannelSlug, draft: AutoChannelDraft) {
	switch (slug) {
		case "autodelete":
			return { allow: draft.allow, bots: draft.bots, delay: draft.delay };
		case "autopurge":
			return {
				filter: draft.filter,
				interval: draft.interval,
				value: autoPurgeValueKind(draft.filter) === null ? null : draft.value.trim(),
			};
		case "automessage":
			return { content: draft.content, interval: draft.interval, mentions: draft.mentions };
	}
}
