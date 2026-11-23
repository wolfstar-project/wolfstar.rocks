import type {
	APIGuildForumChannel,
	APIGuildMediaChannel,
	RESTGetAPIGuildChannelsResult,
} from "discord-api-types/v10";
import { flattenGuildChannel, flattenGuildChannels } from "#server/utils/ApiTransformers";
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

// A Student Hub's directory channel (type 20) failed the whole guild page with
// "Unsupported channel type: 20" (Sentry WOLFSTAR-ROCKS-59).
describe("flattenGuildChannels", () => {
	it("leaves out a directory channel and keeps the others", () => {
		const channels = [
			{ ...base, id: "1", type: ChannelType.GuildText },
			{ ...base, id: "2", type: ChannelType.GuildDirectory },
			{ ...base, id: "3", type: ChannelType.GuildCategory },
		] as unknown as RESTGetAPIGuildChannelsResult;

		expect(flattenGuildChannels(channels).map((channel) => channel.id)).toEqual(["1", "3"]);
	});

	it("leaves out a channel type Discord adds later", () => {
		const channels = [{ ...base, type: 999 }] as unknown as RESTGetAPIGuildChannelsResult;

		expect(flattenGuildChannels(channels)).toEqual([]);
	});
});
