import type { APIMessage } from "discord-api-types/v10";
import {
	appInvites,
	isApplicationProfile,
	resolveMentions,
	toAnnouncements,
} from "#server/utils/announcements";
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
						{
							color: Number.parseInt("5865f2", 16),
							description: "For <@&400000000000000001>",
							title: "v7",
						},
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

	it("keeps an embed whose only content is its thumbnail", () => {
		const [post] = toAnnouncements(
			[
				message("900000000000000002", {
					embeds: [
						{
							thumbnail: {
								url: "https://cdn.example/thumb.png",
								width: 80,
								height: 80,
							},
						},
					],
				}),
			],
			GUILD_ID,
			names,
		);

		expect(post?.embeds).toHaveLength(1);
		expect(post?.embeds[0]?.image?.url).toBe("https://cdn.example/thumb.png");
	});

	it("leaves out the posts with nothing to show", () => {
		expect(
			toAnnouncements([message("900000000000000001", { type: 6 })], GUILD_ID, names),
		).toEqual([]);
	});
});

describe("toAnnouncements with Components V2", () => {
	const media = (url: string) => ({ height: 400, url, width: 800 });

	it("keeps a post whose only content is its components", () => {
		const [post] = toAnnouncements(
			[
				message("900000000000000001", {
					components: [
						{ content: "For <@&400000000000000001>:", type: 10 },
						{
							accent_color: 16_705_372, // #fee75c
							components: [
								{ content: "## v0.16.0 in <#300000000000000001>", type: 10 },
								{ divider: true, spacing: 2, type: 14 },
								{
									accessory: {
										media: media("https://cdn.example/icon.png"),
										type: 11,
									},
									components: [{ content: "What's new", type: 10 }],
									type: 9,
								},
								{
									items: [
										{
											description: "The dashboard",
											media: media("https://cdn.example/a.png"),
										},
										{
											media: media("https://cdn.example/hidden.png"),
											spoiler: true,
										},
									],
									type: 12,
								},
								{
									components: [
										{
											label: "Open",
											style: 5,
											type: 2,
											url: "https://wolfstar.rocks",
										},
										{ custom_id: "vote", label: "Vote", style: 1, type: 2 },
									],
									type: 1,
								},
							],
							type: 17,
						},
					],
					flags: 1 << 15,
				}),
			],
			GUILD_ID,
			names,
		);

		expect(post?.components).toEqual([
			{ content: "For <@Moderator>:", kind: "text" },
			{
				accent: "#fee75c",
				components: [
					{ content: "## v0.16.0 in <#rules>", kind: "text" },
					{ divider: true, kind: "separator", spacing: "large" },
					{
						accessory: {
							image: { alt: undefined, ...media("https://cdn.example/icon.png") },
							kind: "thumbnail",
						},
						kind: "section",
						texts: ["What's new"],
					},
					{
						images: [{ alt: "The dashboard", ...media("https://cdn.example/a.png") }],
						kind: "gallery",
					},
					{ kind: "links", links: [{ label: "Open", url: "https://wolfstar.rocks" }] },
				],
				kind: "container",
			},
		]);
	});

	it("gives a section's link button as its accessory", () => {
		const [post] = toAnnouncements(
			[
				message("900000000000000001", {
					components: [
						{
							accessory: {
								label: "Docs",
								style: 5,
								type: 2,
								url: "https://docs.example",
							},
							components: [{ content: "Read more", type: 10 }],
							type: 9,
						},
					],
				}),
			],
			GUILD_ID,
			names,
		);

		expect(post?.components).toEqual([
			{
				accessory: { kind: "link", label: "Docs", url: "https://docs.example" },
				kind: "section",
				texts: ["Read more"],
			},
		]);
	});

	it("drops rows and galleries left with nothing a reader can use", () => {
		const posts = toAnnouncements(
			[
				message("900000000000000001", {
					components: [
						{ components: [{ custom_id: "a", style: 1, type: 2 }], type: 1 },
						{
							items: [{ media: media("https://cdn.example/x.png"), spoiler: true }],
							type: 12,
						},
					],
				}),
			],
			GUILD_ID,
			names,
		);

		expect(posts).toEqual([]);
	});
});

describe("appInvites", () => {
	it("finds the apps a post invites to, each once, in order", () => {
		expect(
			appInvites(
				"Re-invite her with https://discord.com/oauth2/authorize?client_id=1557826376331960380 to authorize commands.\n" +
					"Or <https://discord.com/oauth2/authorize?scope=bot&client_id=266624760782258186>, " +
					"see https://discord.com/application-directory/266624760782258186 and " +
					"https://discord.com/oauth2/authorize?client_id=1557826376331960380&scope=applications.commands",
			),
		).toEqual([
			{
				id: "1557826376331960380",
				url: "https://discord.com/oauth2/authorize?client_id=1557826376331960380",
			},
			{
				id: "266624760782258186",
				url: "https://discord.com/oauth2/authorize?scope=bot&client_id=266624760782258186",
			},
		]);
	});

	it("leaves the punctuation and markdown after a link out of its address", () => {
		const url = "https://discord.com/oauth2/authorize?client_id=1557826376331960380";
		for (const content of [
			`Invite her: ${url}.`,
			`${url}, or not`,
			`**${url}**`,
			`~~${url}~~!`,
		]) {
			expect(appInvites(content)).toEqual([{ id: "1557826376331960380", url }]);
		}
	});

	it("gives no card to a link the author hid in a spoiler", () => {
		const url = "https://discord.com/oauth2/authorize?client_id=1557826376331960380";
		expect(appInvites(`Guess who: ||${url}||!`)).toEqual([]);
		expect(appInvites(`||the new app\n${url}||`)).toEqual([]);
		expect(appInvites(`||hidden|| then ${url}`)).toEqual([{ id: "1557826376331960380", url }]);
	});

	it("does not pair the pipes in code or after a backslash with a spoiler", () => {
		const url = "https://discord.com/oauth2/authorize?client_id=1557826376331960380";
		expect(appInvites(`Use \`||\` for spoilers. ||${url}||`)).toEqual([]);
		expect(appInvites(`Type \\|\\| for pipes. ||${url}||`)).toEqual([]);
		expect(appInvites(`\`||\` ${url} \`||\``)).toEqual([{ id: "1557826376331960380", url }]);
	});

	it("keeps a link after a backslash, which escapes no letter", () => {
		const url = "https://discord.com/oauth2/authorize?client_id=1557826376331960380";
		expect(appInvites(`\\${url}`)).toEqual([{ id: "1557826376331960380", url }]);
	});

	it("does not open code at an escaped backtick", () => {
		const url = "https://discord.com/oauth2/authorize?client_id=1557826376331960380";
		expect(appInvites(`A \\\` mark, ${url} and \`code\``)).toEqual([
			{ id: "1557826376331960380", url },
		]);
	});

	it("ignores other Discord links", () => {
		expect(
			appInvites(
				"https://discord.com/channels/1/2/3 https://discord.gg/wolfstar https://discord.com/oauth2/authorize",
			),
		).toEqual([]);
	});
});

describe("isApplicationProfile", () => {
	it("accepts a profile with an id and a name, and nothing else", () => {
		expect(isApplicationProfile({ id: "1", name: "WolfStar" })).toBe(true);
		expect(isApplicationProfile({ id: "1" })).toBe(false);
		expect(isApplicationProfile(null)).toBe(false);
		expect(isApplicationProfile("WolfStar")).toBe(false);
	});
});

describe("toAnnouncements with app invites", () => {
	const content =
		"Re-invite her with https://discord.com/oauth2/authorize?client_id=1557826376331960380";

	it("draws the card of an app it could read, from its public profile", () => {
		const [post] = toAnnouncements(
			[message("1", { content })],
			GUILD_ID,
			names,
			new Map([
				[
					"1557826376331960380",
					{
						cover_image: "cover",
						description: " Moderation, in alpha. ",
						icon: "icon",
						id: "1557826376331960380",
						name: "WolfStar Alpha",
					},
				],
			]),
		);

		expect(post?.apps).toEqual([
			{
				cover: "https://cdn.discordapp.com/app-icons/1557826376331960380/cover.webp?size=1024",
				description: "Moderation, in alpha.",
				icon: "https://cdn.discordapp.com/app-icons/1557826376331960380/icon.webp?size=160",
				id: "1557826376331960380",
				name: "WolfStar Alpha",
				url: "https://discord.com/oauth2/authorize?client_id=1557826376331960380",
			},
		]);
	});

	it("falls back to the bot's banner for an app without a cover", () => {
		const [post] = toAnnouncements(
			[message("1", { content })],
			GUILD_ID,
			names,
			new Map([
				[
					"1557826376331960380",
					{
						bot_banner: "banner",
						cover_image: null,
						id: "1557826376331960380",
						name: "WolfStar Alpha",
					},
				],
			]),
		);

		expect(post?.apps[0]?.cover).toBe(
			"https://cdn.discordapp.com/banners/1557826376331960380/banner.webp?size=1024",
		);
		expect(post?.apps[0]?.description).toBeUndefined();
	});

	it("leaves the link plain when the app could not be read", () => {
		const [post] = toAnnouncements([message("1", { content })], GUILD_ID, names);

		expect(post?.apps).toEqual([]);
		expect(post?.content).toBe(content);
	});
});
