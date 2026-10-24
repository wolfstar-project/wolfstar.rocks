import type { APIGuildForumChannel, APIGuildMediaChannel } from "discord-api-types/v10";
import { flattenGuildChannel } from "#server/utils/ApiTransformers";
import { ChannelType } from "discord-api-types/v10";
import { describe, expect, it } from "vitest";

// Discord can send a forum or media channel without `available_tags`; the
// guild page threw on it instead of showing the channel with no tags.
const base = {
	guild_id: "1563165337535389828",
	id: "1563165337535389900",
	name: "ideas",
	permission_overwrites: [],
	position: 3,
};

describe("flattenGuildChannel", () => {
	it("gives a forum channel without available_tags an empty tag list", () => {
		const channel = {
			...base,
			type: ChannelType.GuildForum,
		} as unknown as APIGuildForumChannel;

		expect(flattenGuildChannel(channel).availableTags).toEqual([]);
	});

	it("gives a media channel without available_tags an empty tag list", () => {
		const channel = {
			...base,
			type: ChannelType.GuildMedia,
		} as unknown as APIGuildMediaChannel;

		expect(flattenGuildChannel(channel).availableTags).toEqual([]);
	});

	it("keeps the tags a forum channel has", () => {
		const channel = {
			...base,
			available_tags: [
				{ emoji_id: null, emoji_name: "💡", id: "1", moderated: false, name: "idea" },
			],
			type: ChannelType.GuildForum,
		} as unknown as APIGuildForumChannel;

		expect(flattenGuildChannel(channel).availableTags).toEqual([
			expect.objectContaining({ emoji: { id: null, name: "💡" }, name: "idea" }),
		]);
	});
});
