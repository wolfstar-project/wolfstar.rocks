import type { AutoModerationHardAction, AutoModerationRuleType } from "#shared/utils/automod-rules";

// Static key maps rather than keys built from the value: the i18n report can
// only follow keys it can read in the source.

export const AUTOMOD_TYPE_NAME_KEYS: Record<AutoModerationRuleType, string> = {
	Attachments: "guild_settings.automod.types.Attachments.name",
	Capitals: "guild_settings.automod.types.Capitals.name",
	Characters: "guild_settings.automod.types.Characters.name",
	Duplicates: "guild_settings.automod.types.Duplicates.name",
	Emojis: "guild_settings.automod.types.Emojis.name",
	ImageSpam: "guild_settings.automod.types.ImageSpam.name",
	Invites: "guild_settings.automod.types.Invites.name",
	Links: "guild_settings.automod.types.Links.name",
	LinksCooldown: "guild_settings.automod.types.LinksCooldown.name",
	MaskedLinks: "guild_settings.automod.types.MaskedLinks.name",
	MassMentions: "guild_settings.automod.types.MassMentions.name",
	MentionsCooldown: "guild_settings.automod.types.MentionsCooldown.name",
	MessageSpam: "guild_settings.automod.types.MessageSpam.name",
	Newlines: "guild_settings.automod.types.Newlines.name",
	NoMentionSpam: "guild_settings.automod.types.NoMentionSpam.name",
	Phishing: "guild_settings.automod.types.Phishing.name",
	Spoilers: "guild_settings.automod.types.Spoilers.name",
	Stickers: "guild_settings.automod.types.Stickers.name",
	StickersCooldown: "guild_settings.automod.types.StickersCooldown.name",
	Words: "guild_settings.automod.types.Words.name",
	Zalgo: "guild_settings.automod.types.Zalgo.name",
};

export const AUTOMOD_TYPE_DESCRIPTION_KEYS: Record<AutoModerationRuleType, string> = {
	Attachments: "guild_settings.automod.types.Attachments.description",
	Capitals: "guild_settings.automod.types.Capitals.description",
	Characters: "guild_settings.automod.types.Characters.description",
	Duplicates: "guild_settings.automod.types.Duplicates.description",
	Emojis: "guild_settings.automod.types.Emojis.description",
	ImageSpam: "guild_settings.automod.types.ImageSpam.description",
	Invites: "guild_settings.automod.types.Invites.description",
	Links: "guild_settings.automod.types.Links.description",
	LinksCooldown: "guild_settings.automod.types.LinksCooldown.description",
	MaskedLinks: "guild_settings.automod.types.MaskedLinks.description",
	MassMentions: "guild_settings.automod.types.MassMentions.description",
	MentionsCooldown: "guild_settings.automod.types.MentionsCooldown.description",
	MessageSpam: "guild_settings.automod.types.MessageSpam.description",
	Newlines: "guild_settings.automod.types.Newlines.description",
	NoMentionSpam: "guild_settings.automod.types.NoMentionSpam.description",
	Phishing: "guild_settings.automod.types.Phishing.description",
	Spoilers: "guild_settings.automod.types.Spoilers.description",
	Stickers: "guild_settings.automod.types.Stickers.description",
	StickersCooldown: "guild_settings.automod.types.StickersCooldown.description",
	Words: "guild_settings.automod.types.Words.description",
	Zalgo: "guild_settings.automod.types.Zalgo.description",
};

export const AUTOMOD_HARD_ACTION_KEYS: Record<AutoModerationHardAction, string> = {
	Ban: "guild_settings.automod.hard_actions.Ban",
	Kick: "guild_settings.automod.hard_actions.Kick",
	Mute: "guild_settings.automod.hard_actions.Mute",
	Softban: "guild_settings.automod.hard_actions.Softban",
	Timeout: "guild_settings.automod.hard_actions.Timeout",
	VoiceKick: "guild_settings.automod.hard_actions.VoiceKick",
	Warning: "guild_settings.automod.hard_actions.Warning",
};
