import type { APIGuild, APIGuildMember, RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';
import type { H3Event } from 'h3';
import type { FlattenedGuild, LoginData, OauthFlattenedGuild, PartialOauthFlattenedGuild, TransformedLoginData } from '~~/shared/types/discord';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import {
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildMFALevel,
	GuildPremiumTier,
	GuildVerificationLevel,
	Locale,
	PermissionFlagsBits
} from 'discord-api-types/v10';
import { readSettings } from '~~/server/database/settings/functions';
import { flattenGuild } from '~~/server/utils/ApiTransformers';
import useApi from '~~/shared/utils/api';
import { PermissionsBits } from '~/utils/bits';

/**
 * Get client IP safely
 */
export function getClientIP(event: H3Event): string {
	const forwarded = event.node.req.headers['x-forwarded-for'];
	if (forwarded) {
		return Array.isArray(forwarded) ? forwarded[0] || 'Unknown' : forwarded.split(',')[0] || 'Unknown';
	}

	return event.node.req.headers['X-Real-IP']?.[0] ?? event.node.req.socket?.remoteAddress ?? 'Unknown';
}

export function getErrorStatusCode(error: unknown): number | undefined {
	if (error && typeof error === 'object' && 'statusCode' in error) {
		return error.statusCode as number;
	}
	if (error && typeof error === 'object' && 'status' in error) {
		return error.status as number;
	}
	return undefined;
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'Internal Server Error';
}

/**
 * Enhanced API error handler
 */
export async function handleApiError(error: unknown, event: any, metadata: { requestId: string; duration: number }) {
	const errorInfo = {
		requestId: metadata.requestId,
		url: event.node.req.url,
		method: event.node.req.method,
		duration: metadata.duration,
		timestamp: new Date().toISOString(),
		userAgent: event.node.req.headers['user-agent'],
		ip: getClientIP(event),
		statusCode: getErrorStatusCode(error),
		headers: event.node.req.headers
	};

	// Enhanced logging
	const isServerError = errorInfo.statusCode && errorInfo.statusCode >= 500;
	const logMessage = `${isServerError ? 'ERROR' : 'WARN'}: ${errorInfo.method} ${errorInfo.url}`;
	const logData = {
		requestId: errorInfo.requestId,
		statusCode: errorInfo.statusCode,
		duration: errorInfo.duration,
		error: error instanceof Error ? error.message : String(error)
	};

	isServerError ? useLogger('API').error(logMessage, logData) : useLogger('API').warn(logMessage, logData);
}



function isAdmin(member: APIGuildMember, roles: readonly string[]): boolean {
	const memberRolePermissions = BigInt((member as unknown as { permissions: string }).permissions);
	return roles.length === 0
		? PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.ManageGuild)
		: hasAtLeastOneKeyInMap(new Map(roles.map((role) => [role, true])), member.roles);
}

async function canManage(guild: APIGuild, member: APIGuildMember): Promise<boolean> {
	if (guild.owner_id === member.user.id) 
return true;

	const settings = await readSettings(guild.id);
	return isAdmin(member, settings.rolesAdmin);
}

async function getManageable(id: string, oauthGuild: RESTAPIPartialCurrentUserGuild, guild: APIGuild | undefined): Promise<boolean> {
	if (oauthGuild.owner) 
return true;
	if (typeof guild === 'undefined') 
return PermissionsBits.has(BigInt(oauthGuild.permissions), PermissionFlagsBits.ManageGuild);

	const member = await useApi().guilds.getMember(guild.id, id);
	if (!member) 
return false;

	return canManage(guild, member);
}

async function transformGuild(userId: string, data: RESTAPIPartialCurrentUserGuild): Promise<OauthFlattenedGuild> {
	const guild = await useApi()
		.guilds
.get(data.id, {
			with_counts: true
		})
		.catch(() => undefined);

	const serialized: PartialOauthFlattenedGuild =
		guild === undefined
			? ({
					afkChannelId: null,
					afkTimeout: 60,
					applicationId: null,
					approximateMemberCount: null,
					approximatePresenceCount: null,
					available: true,
					banner: null,
					channels: [],
					defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
					description: null,
					widgetEnabled: false,
					explicitContentFilter: GuildExplicitContentFilter.Disabled,
					emojis: [],
					icon: data.icon,
					id: data.id,
					joinedTimestamp: null,
					mfaLevel: GuildMFALevel.None,
					name: data.name,
					ownerId: data.owner ? userId : null,
					partnered: false,
					preferredLocale: Locale.EnglishUS,
					premiumSubscriptionCount: null,
					premiumTier: GuildPremiumTier.None,
					roles: [],
					splash: null,
					systemChannelId: null,
					vanityURLCode: null,
					verificationLevel: GuildVerificationLevel.None,
					verified: false
				} as unknown as FlattenedGuild)
			: flattenGuild({ ...guild, channels: (await useApi().guilds.getChannels(guild.id)) as any });

	return {
		...serialized,
		permissions: Number(data.permissions),
		manageable: await getManageable(userId, data, guild),
		wolfstarIsIn: typeof guild !== 'undefined'
	};
}

export async function transformOauthGuildsAndUser({ user, guilds }: LoginData): Promise<TransformedLoginData> {
	if (!user || !guilds) 
return { user, guilds };

	const userId = user.id;

	const transformedGuilds = await Promise.all(guilds.map((guild) => transformGuild(userId, guild)));
	return { user, transformedGuilds };
}
