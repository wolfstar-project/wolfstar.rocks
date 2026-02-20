import type { ImageURLOptions, MakeURLOptions } from "@discordjs/rest";
import type { APIUser } from "discord-api-types/v10";
import type { MaybeRef } from "vue";
import type { OauthFlattenedGuild } from "../types/discord";
import { ALLOWED_EXTENSIONS, ALLOWED_SIZES, DefaultRestOptions } from "@discordjs/rest";
import { isNullOrUndefined } from "@sapphire/utilities";
import { toValue } from "vue";

/**
 * Minimal user type that can be used for avatar URL generation
 * Compatible with both APIUser and User from #auth-utils
 */
export interface AvatarUser {
	id: string;
	avatar: string | null;
}

function dynamicMakeURL(
	route: string,
	hash: string,
	{ forceStatic = false, ...options }: Readonly<ImageURLOptions> = {},
): string {
	return makeURL(
		route,
		!forceStatic && hash.startsWith("a_") ? { ...options, extension: "gif" } : options,
	);
}

function makeURL(
	route: string,
	{
		allowedExtensions = ALLOWED_EXTENSIONS,
		base = DefaultRestOptions.cdn,
		extension = "webp",
		size,
		animated,
	}: Readonly<MakeURLOptions> = {},
): string {
	extension = String(extension).toLowerCase();

	if (!allowedExtensions.includes(extension)) {
		throw new RangeError(
			`Invalid extension provided: ${extension}\nMust be one of: ${allowedExtensions.join(", ")}`,
		);
	}

	if (size && !ALLOWED_SIZES.includes(size)) {
		throw new RangeError(
			`Invalid size provided: ${size}\nMust be one of: ${ALLOWED_SIZES.join(", ")}`,
		);
	}

	const url = new URL(`${base}${route}.${extension}`);

	if (animated !== undefined) {
		url.searchParams.set("animated", String(animated));
	}

	if (size) {
		url.searchParams.set("size", String(size));
	}

	return url.toString();
}

function defaultAvatar(index: number, options?: Readonly<ImageURLOptions>): string {
	return makeURL(`/embed/avatars/${index}`, { ...options, extension: "png" });
}

/**
 * Generate avatar URL for a Discord user
 * @param user - User object or ref to user object (APIUser or minimal AvatarUser)
 * @param options - Image URL options (size, format, etc.)
 * @returns Avatar URL string
 */
export function avatarURL(
	user: MaybeRef<AvatarUser | APIUser>,
	options?: Readonly<ImageURLOptions>,
): string {
	const userData = toValue(user);

	if (isNullOrUndefined(userData.avatar)) {
		return defaultAvatar(Number(BigInt(userData.id) >> 22n) % 5, options);
	}

	return dynamicMakeURL(`/avatars/${userData.id}/${userData.avatar}`, userData.avatar, options);
}

export function guildIconURL(
	guild: MaybeRef<OauthFlattenedGuild>,
	options?: Readonly<ImageURLOptions>,
): string | null {
	const guildData = toValue(guild);
	if (isNullOrUndefined(guildData.icon)) {
		return guildData.acronym;
	}

	return dynamicMakeURL(`/icons/${guildData.id}/${guildData.icon}`, guildData.icon, options);
}
