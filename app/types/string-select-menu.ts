// Kept in its own leaf module (no imports) so `app/utils/constants.ts` can type its
// showcase mocks against it without creating an import cycle with `app/types/discord.ts`,
// which depends on `ProfileName` from that same constants module.
export interface StringSelectMenuOption {
	value: string;
	label: string;
	description?: string;
	/** Unicode emoji, or an image URL/path (`http…`, `/…`, `./…`). */
	emoji?: string;
	emojiName?: string;
	disabled?: boolean;
}
