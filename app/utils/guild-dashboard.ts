import { guildIconURL, type IconGuild } from "#shared/utils/discord";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

export type GuildErrorClass = "forbidden" | "unauthorized" | "default";

export type GuildSettingsSaveFailureToast = {
	color: "error";
	title: string;
	description: string;
	icon: "heroicons:x-circle";
};

/**
 * Resolves a Discord CDN guild-icon URL for dashboard avatars.
 * Callers must pass the unwrapped guild value (`guildData.value`), not the
 * readonly ref wrapper — reading `icon`/`acronym` off the ref returns undefined.
 */
export function resolveGuildIconSrc(
	guild: IconGuild | null | undefined,
	options: { size?: number } = {},
): string | undefined {
	if (isNullOrUndefined(guild)) {
		return undefined;
	}
	return guildIconURL(guild, { size: options.size ?? 64 }) ?? undefined;
}

/**
 * Maps an HTTP status code from a guild dashboard fetch error to one of three
 * handled cases so the watcher in `dashboard.vue` can be tested without
 * mounting the full layout.
 */
export function classifyGuildError(status: number | undefined): GuildErrorClass {
	if (status === 403) return "forbidden";
	if (status === 401) return "unauthorized";
	return "default";
}

/**
 * Normalizes a guild-settings PATCH response body into `GuildData`.
 * Throws when the payload is a malformed JSON string so callers can treat
 * transport failures and parse failures the same way.
 */
export function parseGuildSettingsSaveResponse(response: unknown): unknown {
	return typeof response === "string" ? JSON.parse(response) : response;
}

/**
 * Localized toast payload shown when saving guild settings fails.
 * Staged edits must be left intact by the caller so the admin can retry.
 */
export function guildSettingsSaveFailureToast(
	t: (key: string) => string,
	error?: unknown,
): GuildSettingsSaveFailureToast {
	return {
		color: "error",
		title: t("dashboard.update_failed_message"),
		description:
			settingsRefusalMessage(t, error) ??
			`${t("dashboard.update_failed_why")} ${t("dashboard.update_failed_fix")}`,
		icon: "heroicons:x-circle",
	};
}

/**
 * What to tell the admin when the server refused the change for a reason they
 * can fix, read from the error's code; `null` for any other failure. Literal
 * keys, one per code, so the i18n report sees each.
 */
function settingsRefusalMessage(t: (key: string) => string, error: unknown): string | null {
	const data = (error as { data?: { code?: unknown; data?: { code?: unknown } } } | null)?.data;
	switch (data?.code ?? data?.data?.code) {
		case "honeypot-same-channel":
			return t("guild_settings.honeypot.errors.same_channel");
		case "honeypot-unknown-channel":
			return t("guild_settings.honeypot.errors.unknown_channel");
		case "honeypot-trap-permissions":
			return t("guild_settings.honeypot.errors.trap_permissions");
		case "honeypot-log-permissions":
			return t("guild_settings.honeypot.errors.log_permissions");
		default:
			return null;
	}
}

/**
 * Safely parses a raw JSON string of guild settings.  Falls back to
 * `fallback` when the string is malformed or when the parsed value is not a
 * plain object (e.g. an array or primitive).  The optional `onError` callback
 * is invoked with the caught error so callers can log it without coupling this
 * pure helper to any logging infrastructure.
 *
 * **Note:** the plain-object check uses `Object.getPrototypeOf(parsed) === Object.prototype`
 * intentionally — objects with null prototypes or non-plain class instances are rejected in
 * favour of the `fallback`, since guild settings are always plain JSON objects.
 */
export function parseGuildSettings<Settings extends object>(
	raw: string,
	fallback: Settings,
	onError?: (err: unknown) => void,
): Settings {
	try {
		const parsed: unknown = JSON.parse(raw);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			!Array.isArray(parsed) &&
			Object.getPrototypeOf(parsed) === Object.prototype
		) {
			return parsed as Settings;
		}
		return fallback;
	} catch (err) {
		onError?.(err);
		return fallback;
	}
}

/**
 * Picks the guilds that belong in the dashboard's server rail: every one the
 * viewer can manage. Those WolfStar has joined open their dashboard; the
 * others invite it. Sorted by name so the rail order stays stable between
 * refreshes of `/api/users`.
 */
export function selectDashboardRailGuilds(
	guilds: readonly OauthFlattenedGuild[],
): OauthFlattenedGuild[] {
	return guilds
		.filter((guild) => guild.manageable)
		.toSorted((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

/**
 * Maps a section slug from a pre-V7 `/guilds/:id/manage/*` link to the section
 * that holds those settings now. The per-filter pages became auto-moderation
 * rules, and the event toggles moved next to the moderation log channel.
 */
export function resolveLegacyDashboardSection(slug: string): string {
	if (slug.startsWith("moderation/")) return "automod";
	if (slug === "events") return "moderation";
	// Reports had a page of their own before they moved in with the cases.
	if (slug === "reports") return "moderation";
	return slug;
}
