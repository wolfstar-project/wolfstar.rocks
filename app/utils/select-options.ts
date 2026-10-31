import type { DeepReadonly } from "@sapphire/utilities";
import type { SelectOption } from "~/components/select/Base.vue";
import { ChannelType } from "discord-api-types/v10";

type SelectGuild =
	| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
	| undefined;

/**
 * The channels WolfStar can post in, in the order Discord lists them and
 * grouped under their category.
 */
export function channelOptions(guild: SelectGuild): SelectOption[] {
	const channels = guild?.channels ?? [];
	const categories = new Map(
		channels
			.filter((channel) => channel.type === ChannelType.GuildCategory)
			.map((category) => [category.id, category]),
	);
	const categoryPosition = (parentId: string | null) =>
		parentId === null ? -1 : (categories.get(parentId)?.rawPosition ?? -1);

	return channels
		.filter(
			(channel) =>
				channel.type === ChannelType.GuildText ||
				channel.type === ChannelType.GuildAnnouncement,
		)
		.toSorted(
			(a, b) =>
				categoryPosition(a.parentId) - categoryPosition(b.parentId) ||
				a.rawPosition - b.rawPosition,
		)
		.map((channel) => ({
			group: channel.parentId === null ? undefined : categories.get(channel.parentId)?.name,
			label: channel.name,
			value: channel.id,
		}));
}

/** A role's colour as CSS, or nothing for a role that has Discord's default. */
function roleColor(color: number): string | undefined {
	return color === 0 ? undefined : `#${color.toString(16).padStart(6, "0")}`;
}

/**
 * The roles of a guild, highest first. `@everyone` is left out, as nobody is
 * given it, unless `everyone` asks for it: a dashboard access rule can name it.
 */
export function roleOptions(
	guild: SelectGuild,
	{ everyone = false }: { everyone?: boolean } = {},
): SelectOption[] {
	return [...(guild?.roles ?? [])]
		.filter((role) => everyone || role.id !== guild?.id)
		.toSorted((a, b) => b.rawPosition - a.rawPosition)
		.map((role) => ({ color: roleColor(role.color), label: role.name, value: role.id }));
}
