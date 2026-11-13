import { isSnowflake } from "./snowflake";

/**
 * What a case holds besides its `ModerationAction` row, read from the
 * `extra_data` column of `ModerationCaseData`. The bot writes one shape per
 * case type (`ExtraDataTypes` in
 * `projects/bot/src/lib/moderation/managers/ModerationManagerEntry.ts`):
 *
 * - a mute stores the roles the member had, which it removed and gives back
 *   when the mute is lifted (`RoleModerationAction.ts`);
 * - a role added or removed stores that role;
 * - a nickname change stores the nickname the member had before.
 *
 * The other types store nothing.
 */
export type ModerationCaseExtra =
	| { kind: "roles"; roleIds: string[] }
	| { kind: "role"; roleId: string }
	| { kind: "nickname"; previous: string | null };

/** The message a case is about, which the bot's case embed links to. */
export interface ModerationCaseMessage {
	channelId: string;
	messageId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Reads the `extra_data` JSON of a case. The column is written by the bot and
 * not validated by the database, so anything that is not one of the shapes
 * above reads as nothing rather than reaching the page.
 */
export function parseModerationCaseExtra(value: unknown): ModerationCaseExtra | null {
	if (Array.isArray(value)) {
		const roleIds = value.filter((item) => isSnowflake(item));
		return roleIds.length > 0 ? { kind: "roles", roleIds } : null;
	}

	if (!isRecord(value)) return null;

	const role = value["role"];
	if (isSnowflake(role)) return { kind: "role", roleId: role };

	if ("oldName" in value) {
		const previous = value["oldName"];
		if (previous === null || typeof previous === "string") {
			return { kind: "nickname", previous };
		}
	}

	return null;
}

/** The link Discord opens a message at, the one `messageLink()` builds in the bot. */
export function discordMessageUrl(guildId: string, message: ModerationCaseMessage): string {
	return `https://discord.com/channels/${guildId}/${message.channelId}/${message.messageId}`;
}

/**
 * When a temporary case ends: its creation plus its duration, which the
 * `ModerationAction` table stores in seconds and `0` for a case that is not
 * temporary (`encodeModerationRecordDuration()` in the bot's `ModerationRecord.ts`).
 */
export function moderationCaseExpiresAt(createdAt: string | null, duration: number): Date | null {
	if (!createdAt || duration <= 0) return null;
	const created = new Date(createdAt).getTime();
	if (Number.isNaN(created)) return null;
	return new Date(created + duration * 1000);
}
