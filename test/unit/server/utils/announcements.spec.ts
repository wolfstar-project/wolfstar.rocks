import type { APIMessage } from "discord-api-types/v10";
import { resolveMentions, toAnnouncements } from "#server/utils/announcements";
import { describe, expect, it } from "vitest";

const GUILD_ID = "254360814063058944";
const CHANNEL_ID = "890648971712802906";

const names = {
	channels: new Map([["300000000000000001", "rules"]]),
	roles: new Map([["400000000000000001", "Moderator"]]),
	users: new Map([["500000000000000001", "RedStar"]]),
};

function message(id: string, overrides: Partial<APIMessage> = {}): APIMessage {
	return {
		attachments: [],
		author: { avatar: null, discriminator: "0", global_name: null, id: "1", username: "staff" },
		channel_id: CHANNEL_ID,
		content: "",
		edited_timestamp: null,
		embeds: [],
		id,
		mention_everyone: false,
		mention_roles: [],
		mentions: [],
		pinned: false,
		timestamp: "2026-11-01T10:00:00.000Z",
		tts: false,
		type: 0,
		...overrides,
	} as APIMessage;
}

describe("resolveMentions", () => {
	it("writes users, roles and channels by name", () => {
		expect(
			resolveMentions(
				"<@500000000000000001> <@!500000000000000001> <@&400000000000000001> <#300000000000000001>",
				names,
			),
		).toBe("<@RedStar> <@RedStar> <@Moderator> <#rules>");
	});

	it("reads a mention whose target is gone as Discord does", () => {
		expect(
			resolveMentions(
				"<@500000000000000099> <@&400000000000000099> <#300000000000000099>",
				names,
			),
		).toBe("<@unknown-user> <@unknown-role> <#unknown>");
	});
});

describe("toAnnouncements", () => {
	it("lists the posts oldest first, with a link to each on Discord", () => {
		const posts = toAnnouncements(
			[
				message("900000000000000002", { content: "second" }),
				message("900000000000000001", { content: "first" }),
			],
			GUILD_ID,
			names,
		);

		expect(posts.map((post) => post.content)).toEqual(["first", "second"]);
		expect(posts[0]?.url).toBe(
			`https://discord.com/channels/${GUILD_ID}/${CHANNEL_ID}/900000000000000001`,
		);
	});

	it("names the users a post mentions from the post itself", () => {
		const [post] = toAnnouncements(
			[
				message("900000000000000001", {
					content: "Thanks <@600000000000000001>!",
					mentions: [
						{
							avatar: null,
							discriminator: "0",
							global_name: "Stella",
							id: "600000000000000001",
							username: "stella.dev",
						},
					],
				}),
			],
			GUILD_ID,
			names,
		);

		expect(post?.content).toBe("Thanks <@Stella>!");
	});

	it("keeps embeds with their colour, images and the reactions' counts", () => {
		const [post] = toAnnouncements(
			[
				message("900000000000000001", {
					attachments: [
						{
							content_type: "image/png",
							filename: "a.png",
							height: 630,
							id: "1",
							proxy_url: "",
							size: 1,
							url: "https://cdn.discordapp.com/attachments/a.png",
							width: 1200,
						},
						{
							filename: "notes.txt",
							id: "2",
							proxy_url: "",
							size: 1,
							url: "https://x/notes.txt",
						},
					],
					embeds: [
						{ color: 0x5865F2, description: "For <@&400000000000000001>", title: "v7" },
					],
					reactions: [
						{
							count: 12,
							count_details: { burst: 0, normal: 12 },
							burst_colors: [],
							emoji: { id: null, name: "🎉" },
							me: false,
							me_burst: false,
						},
						{
							count: 3,
							count_details: { burst: 0, normal: 3 },
							burst_colors: [],
							emoji: { animated: false, id: "700000000000000001", name: "wolf" },
							me: false,
							me_burst: false,
						},
					],
				}),
			],
			GUILD_ID,
			names,
		);

		expect(post?.embeds).toEqual([
			{
				color: "#5865f2",
				description: "For <@Moderator>",
				image: undefined,
				title: "v7",
				url: undefined,
			},
		]);
		expect(post?.images).toEqual([
			{ height: 630, url: "https://cdn.discordapp.com/attachments/a.png", width: 1200 },
		]);
		expect(post?.reactions).toEqual([
			{ count: 12, image: undefined, name: "🎉" },
			{
				count: 3,
				image: "https://cdn.discordapp.com/emojis/700000000000000001.webp?size=48",
				name: "wolf",
			},
		]);
	});

	it("leaves out the posts with nothing to show", () => {
		expect(
			toAnnouncements([message("900000000000000001", { type: 6 })], GUILD_ID, names),
		).toEqual([]);
	});
});
