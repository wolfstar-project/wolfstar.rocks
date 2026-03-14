import type {
	FlattenedAnnouncementChannel,
	FlattenedAnyChannel,
	FlattenedCategoryChannel,
	FlattenedDMChannel,
	FlattenedForumChannel,
	FlattenedGroupDMChannel,
	FlattenedGuild,
	FlattenedGuildEmoji,
	FlattenedMediaChannel,
	FlattenedMember,
	FlattenedRole,
	FlattenedStageVoiceChannel,
	FlattenedTextChannel,
	FlattenedThreadChannel,
	FlattenedUser,
	FlattenedVoiceChannel,
} from "#shared/types";
import type {
	APIChannel,
	APIDMChannel,
	APIEmoji,
	APIGroupDMChannel,
	APIGuild,
	APIGuildCategoryChannel,
	APIGuildChannel,
	APIGuildForumChannel,
	APIGuildMediaChannel,
	APIGuildMember,
	APIGuildStageVoiceChannel,
	APIGuildVoiceChannel,
	APINewsChannel,
	APIOverwrite,
	APIRole,
	APITextChannel,
	APIThreadChannel,
	APIUser,
	Locale,
	RESTGetAPIGuildChannelsResult,
} from "discord-api-types/v10";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { lazy } from "@sapphire/utilities";
import { ChannelType, GuildFeature } from "discord-api-types/v10";

// #region Guild

export function flattenGuild(
	guild: APIGuild & {
		channels: RESTGetAPIGuildChannelsResult;
	},
): FlattenedGuild {
	return {
		afkChannelId: guild.afk_channel_id,
		afkTimeout: guild.afk_timeout,
		applicationId: guild.application_id,
		approximateMemberCount: guild.approximate_member_count ?? 0,
		approximatePresenceCount: guild.approximate_presence_count ?? 0,
		banner: guild.banner,
		defaultMessageNotifications: guild.default_message_notifications,
		description: guild.description,
		widgetEnabled: guild.widget_enabled ?? false,
		explicitContentFilter: guild.explicit_content_filter,
		features: guild.features,
		icon: guild.icon,
		id: guild.id,
		joinedTimestamp: "joined_at" in guild ? Date.parse(guild.joined_at as string) : null,
		mfaLevel: guild.mfa_level,
		name: guild.name,
		acronym: guildNameToAcronym(guild.name),
		ownerId: guild.owner_id,
		partnered: guild.features.includes(GuildFeature.Partnered),
		preferredLocale: guild.preferred_locale as Locale,
		premiumSubscriptionCount: guild.premium_subscription_count ?? 0,
		premiumTier: guild.premium_tier,
		roles: guild.roles.map((role) => flattenRole(guild.id, role)),
		splash: guild.splash,
		systemChannelId: guild.system_channel_id,
		vanityURLCode: guild.vanity_url_code,
		verificationLevel: guild.verification_level,
		verified: guild.features.includes(GuildFeature.Verified),
		channels: guild.channels.map((channel) => flattenGuildChannel(channel as any)) ?? [],
		emojis: guild.emojis.map((emoji) => flattenGuildEmoji(guild.id, emoji)),
	};
}

// #endregion Guild

// #region Emoji

export function flattenGuildEmoji(guildId: string, emoji: APIEmoji): FlattenedGuildEmoji {
	return {
		animated: emoji.animated ?? false,
		available: emoji.available ?? false,
		guildId,
		id: emoji.id ?? "",
		managed: emoji.managed ?? false,
		name: emoji.name ?? null,
		require_colons: Boolean(emoji.require_colons),
		roles: [],
	};
}

// #region Role

export function flattenRole(guildId: string, role: APIRole): FlattenedRole {
	return {
		color: role.color,
		guildId: guildId ?? null,
		hoist: role.hoist,
		icon: role.icon ?? null,
		id: role.id,
		managed: role.managed,
		mentionable: role.mentionable,
		name: role.name,
		permissions: role.permissions,
		rawPosition: role.position,
	};
}

function transformPermissionOverwrites(
	overwrites: APIOverwrite[] | undefined,
): [string, { id: string; type: string; deny: number; allow: number }][] {
	return (overwrites ?? []).map((overwrite) => [
		overwrite.id,
		{
			allow: Number(overwrite.allow),
			deny: Number(overwrite.deny),
			id: overwrite.id,
			type: String(overwrite.type),
		},
	]);
}

export function getParentChannel(
	channel: APIThreadChannel | Exclude<APIChannel, APIDMChannel | APIGroupDMChannel>,
) {
	const channelResult = lazy(async () => {
		if (!channel.parent_id) {
			return null;
		}
		const parentChannel = await useApi().channels.get(channel.parent_id);
		if (parentChannel.type !== ChannelType.GuildCategory) {
			return null;
		}
		return flattenChannelCategory(parentChannel as APIGuildCategoryChannel);
	});
	return channelResult;
}

// #endregion Role

// #region Channel

export function flattenChannel(channel: APINewsChannel): FlattenedAnnouncementChannel;
export function flattenChannel(channel: APITextChannel): FlattenedTextChannel;
export function flattenChannel(channel: APIGuildVoiceChannel): FlattenedVoiceChannel;
export function flattenChannel(channel: APIDMChannel): FlattenedDMChannel;
export function flattenChannel(channel: APIThreadChannel): FlattenedThreadChannel;
export function flattenChannel(channel: APIGuildCategoryChannel): FlattenedCategoryChannel;
export function flattenChannel(channel: APIGuildForumChannel): FlattenedForumChannel;
export function flattenChannel(channel: APIGuildMediaChannel): FlattenedMediaChannel;
export function flattenChannel(channel: APIThreadChannel | APIChannel): FlattenedAnyChannel {
	switch (channel.type) {
		case ChannelType.GuildAnnouncement: {
			return flattenChannelAnnouncement(channel);
		}
		case ChannelType.GuildText: {
			return flattenChannelText(channel);
		}
		case ChannelType.GuildVoice: {
			return flattenChannelVoice(channel);
		}
		case ChannelType.GuildStageVoice: {
			return flattenChannelStageVoice(channel);
		}
		case ChannelType.DM: {
			return flattenChannelDM(channel);
		}
		case ChannelType.GroupDM: {
			return flattenChannelGroupDM(channel);
		}
		case ChannelType.GuildCategory: {
			return flattenChannelCategory(channel);
		}
		case ChannelType.PublicThread:
		case ChannelType.PrivateThread:
		case ChannelType.AnnouncementThread: {
			return flattenChannelThread(channel);
		}

		case ChannelType.GuildForum: {
			return flattenChannelForum(channel);
		}

		case ChannelType.GuildMedia: {
			return flattenChannelMedia(channel);
		}
		default: {
			throw new Error(`Unsupported channel type: unknown`);
		}
	}
}

export function flattenGuildChannel(channel: APINewsChannel): FlattenedAnnouncementChannel;
export function flattenGuildChannel(channel: APITextChannel): FlattenedTextChannel;
export function flattenGuildChannel(channel: APIGuildVoiceChannel): FlattenedVoiceChannel;
export function flattenGuildChannel(channel: APIThreadChannel): FlattenedThreadChannel;
export function flattenGuildChannel(channel: APIGuildCategoryChannel): FlattenedCategoryChannel;
export function flattenGuildChannel(channel: APIGuildForumChannel): FlattenedForumChannel;
export function flattenGuildChannel(channel: APIGuildMediaChannel): FlattenedMediaChannel;
export function flattenGuildChannel(
	channel: APIGuildChannel<GuildChannelType> | APIThreadChannel,
): Exclude<FlattenedAnyChannel, FlattenedDMChannel | FlattenedGroupDMChannel> {
	switch (channel.type) {
		case ChannelType.GuildAnnouncement: {
			return flattenChannelAnnouncement(channel as APINewsChannel);
		}
		case ChannelType.GuildText: {
			return flattenChannelText(channel as APITextChannel);
		}
		case ChannelType.GuildVoice: {
			return flattenChannelVoice(channel as APIGuildVoiceChannel);
		}
		case ChannelType.GuildStageVoice: {
			return flattenChannelStageVoice(channel as APIGuildStageVoiceChannel);
		}
		case ChannelType.GuildCategory: {
			return flattenChannelCategory(channel as APIGuildCategoryChannel);
		}
		case ChannelType.PublicThread:
		case ChannelType.PrivateThread:
		case ChannelType.AnnouncementThread: {
			return flattenChannelThread(channel as APIThreadChannel);
		}
		case ChannelType.GuildForum: {
			return flattenChannelForum(channel as APIGuildForumChannel);
		}
		case ChannelType.GuildMedia: {
			return flattenChannelMedia(channel as APIGuildMediaChannel);
		}
		default: {
			throw new Error(`Unsupported channel type: ${(channel as APIChannel).type}`);
		}
	}
}

function flattenChannelCategory(channel: APIGuildCategoryChannel): FlattenedCategoryChannel {
	return {
		id: channel.id,
		type: channel.type,
		guildId: channel.guild_id ?? null,
		name: channel.name,
		rawPosition: channel.position ?? 0,
		parentId: channel.parent_id ?? null, // Categories cannot have parents,
		permissionOverwrites: transformPermissionOverwrites(channel.permission_overwrites),
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
	};
}

function flattenChannelAnnouncement(channel: APINewsChannel): FlattenedAnnouncementChannel {
	return {
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		guildId: channel.guild_id ?? null,
		id: channel.id,
		lastPinTimestamp: channel.last_pin_timestamp
			? Date.parse(channel.last_pin_timestamp)
			: null,
		name: channel.name,
		nsfw: channel.nsfw ?? false,
		parentId: channel.parent_id ?? null,
		permissionOverwrites: transformPermissionOverwrites(channel.permission_overwrites),
		rawPosition: channel.position ?? 0,
		topic: channel.topic ?? null,
		type: channel.type,
	};
}

function flattenChannelText(channel: APITextChannel): FlattenedTextChannel {
	return {
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		guildId: channel.guild_id ?? null,
		id: channel.id,
		lastPinTimestamp: channel.last_pin_timestamp
			? Date.parse(channel.last_pin_timestamp)
			: null,
		name: channel.name,
		nsfw: channel.nsfw ?? false,
		parentId: channel.parent_id ?? null,
		permissionOverwrites: transformPermissionOverwrites(channel.permission_overwrites),
		rateLimitPerUser: channel.rate_limit_per_user ?? 0,
		rawPosition: channel.position ?? 0,
		topic: channel.topic ?? null,
		type: channel.type,
	};
}

function flattenChannelVoice(
	channel: APIGuildVoiceChannel,
	guildId?: string,
): FlattenedVoiceChannel {
	return {
		bitrate: channel.bitrate ?? 64_000,
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		guildId: channel.guild_id ?? guildId ?? null,
		id: channel.id,
		name: channel.name ?? "",
		parentId: channel.parent_id ?? null,
		permissionOverwrites: transformPermissionOverwrites(channel.permission_overwrites),
		rawPosition: channel.position ?? 0,
		rtcRegion: channel.rtc_region ?? null,
		type: channel.type,
		userLimit: channel.user_limit ?? 0,
		videoQualityMode: channel.video_quality_mode ?? 1,
	};
}

function flattenChannelStageVoice(
	channel: APIGuildStageVoiceChannel,
	guildId?: string,
): FlattenedStageVoiceChannel {
	return {
		bitrate: channel.bitrate ?? 64_000,
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		guildId: channel.guild_id ?? guildId ?? null,
		id: channel.id,
		name: channel.name ?? "",
		parentId: channel.parent_id ?? null,
		permissionOverwrites: transformPermissionOverwrites(channel.permission_overwrites),
		rawPosition: channel.position ?? 0,
		rtcRegion: channel.rtc_region ?? null,
		type: channel.type,
		userLimit: channel.user_limit ?? 0,
		videoQualityMode: channel.video_quality_mode ?? 1,
	};
}

function flattenChannelGroupDM(channel: APIGroupDMChannel): FlattenedGroupDMChannel {
	return {
		applicationId: channel.application_id ?? null,
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		icon: channel.icon ?? null,
		id: channel.id,
		lastMessageId: channel.last_message_id ?? null,
		name: channel.name ?? null,
		ownerId: channel.owner_id ?? null,
		recipients: channel.recipients?.map((recipient) => flattenUser(recipient)) ?? null,
		type: channel.type,
	};
}

function flattenChannelForum(channel: APIGuildForumChannel): FlattenedForumChannel {
	return {
		availableTags:
			channel.available_tags.map((tag) => ({
				emoji: { id: tag.emoji_id ?? null, name: tag.emoji_name ?? null },
				...tag,
			})) ?? [],
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		defaultAutoArchiveDuration: channel.default_auto_archive_duration ?? 60,
		defaultReactionEmoji: {
			id: channel.default_reaction_emoji?.emoji_id ?? null,
			name: channel.default_reaction_emoji?.emoji_name ?? null,
		},
		defaultSortOrder: channel.default_sort_order ?? 0,
		defaultThreadRateLimitPerUser: channel.default_thread_rate_limit_per_user ?? 0,
		guildId: channel.guild_id ?? null,
		id: channel.id,
		lastMessageId: channel.last_message_id ?? null,
		lastPinTimestamp: channel.last_pin_timestamp
			? Date.parse(channel.last_pin_timestamp)
			: null,
		name: channel.name,
		parentId: channel.parent_id ?? null,
		permissionOverwrites: transformPermissionOverwrites(channel.permission_overwrites),
		rateLimitPerUser: channel.rate_limit_per_user ?? 0,
		rawPosition: channel.position ?? 0,
		topic: channel.topic ?? null,
		type: channel.type,
	};
}

function flattenChannelMedia(channel: APIGuildMediaChannel): FlattenedMediaChannel {
	return {
		availableTags:
			channel.available_tags.map((tag) => ({
				...tag,
				emoji: { id: tag.emoji_id ?? null, name: tag.emoji_name ?? null },
			})) ?? [],
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		defaultAutoArchiveDuration: channel.default_auto_archive_duration ?? 60,
		defaultReactionEmoji: {
			id: channel.default_reaction_emoji?.emoji_id ?? null,
			name: channel.default_reaction_emoji?.emoji_name ?? null,
		},
		defaultSortOrder: channel.default_sort_order ?? 0,
		defaultThreadRateLimitPerUser: channel.default_thread_rate_limit_per_user ?? 0,
		guildId: channel.guild_id ?? null,
		id: channel.id,
		lastMessageId: channel.last_message_id ?? null,
		lastPinTimestamp: channel.last_pin_timestamp
			? Date.parse(channel.last_pin_timestamp)
			: null,
		name: channel.name,
		parentId: channel.parent_id ?? null,
		permissionOverwrites: transformPermissionOverwrites(channel.permission_overwrites),
		rateLimitPerUser: channel.rate_limit_per_user ?? 0,
		rawPosition: channel.position ?? 0,
		topic: channel.topic ?? null,
		type: channel.type,
	};
}

function flattenChannelDM(channel: APIDMChannel): FlattenedDMChannel {
	return {
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		id: channel.id,
		recipient: channel.recipients?.[0]?.id ?? null,
		type: channel.type,
	};
}

function flattenChannelThread(channel: APIThreadChannel, guildId?: string): FlattenedThreadChannel {
	return {
		id: channel.id,
		type: channel.type,
		archived: channel.thread_metadata?.archived ?? false,
		archivedTimestamp: channel.thread_metadata?.archive_timestamp
			? Date.parse(channel.thread_metadata.archive_timestamp)
			: null,
		createdTimestamp: DiscordSnowflake.timestampFrom(channel.id),
		guildId: channel.guild_id ?? guildId ?? null,
		name: channel.name,
		parentId: channel.parent_id ?? null,
		ownerId: channel.owner_id ?? null,
		permissionOverwrites: [],
		// @ts-expect-error - position is not a property of APIThreadChannel
		rawPosition: channel.position ?? 0,
		threadMetadata: channel.thread_metadata
			? {
					archiveTimestamp: channel.thread_metadata.archive_timestamp,
					archived: channel.thread_metadata.archived,
					autoArchiveDuration: channel.thread_metadata.auto_archive_duration,
					locked: channel.thread_metadata.locked,
				}
			: null,
		rateLimitPerUser: channel.rate_limit_per_user ?? null,
	};
}

// #endregion Channel

// #region User

export function flattenUser(user: APIUser): FlattenedUser {
	return {
		avatar: user.avatar,
		bot: user.bot ?? false,
		discriminator: user.discriminator,
		globalName: user.global_name,
		id: user.id,
		username: user.username,
	};
}

// #endregion User

// #region Member

export function flattenMember(member: APIGuildMember, guild: APIGuild): FlattenedMember {
	return {
		guildId: guild.id,
		id: member.user.id,
		joinedTimestamp: member.joined_at ? Date.parse(member.joined_at) : null,
		premiumSinceTimestamp: member.premium_since ? Date.parse(member.premium_since) : null,
		roles: member.roles
			.map((roleId) => {
				const role = guild.roles.find((r) => r.id === roleId);
				return role ? flattenRole(guild.id, role) : null;
			})
			.filter((role): role is FlattenedRole => role !== null),
		user: flattenUser(member.user),
	};
}

// #endregion Member
