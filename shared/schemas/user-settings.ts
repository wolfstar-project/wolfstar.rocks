import { boolean, object } from "valibot";

/**
 * The settings a user keeps in WolfStar, the same in every server: the
 * `User` row the bot reads. `report` is whether WolfStar sends them a direct
 * message when a moderator, or the auto-moderation, takes an action on them.
 */
export const UserSettingsUpdateSchema = object({
	report: boolean(),
});

export interface UserSettings {
	report: boolean;
}
