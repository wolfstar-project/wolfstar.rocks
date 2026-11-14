import type {
	Announcement,
	AnnouncementApp,
	AnnouncementComponent,
} from "#shared/types/announcement";

/** Two posts of WolfStar's announcement channel, as `/api/announcements/wolfstar` returns them. */
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
	{
		apps: [],
		at: "2026-10-11T09:12:00.000Z",
		components: [],
		content:
			"## Dashboard v3\nThanks <@Moderator> and <@Jane Doe>, read more in <#rules>.\n- Pins\n- Recent modules",
		embeds: [],
		id: "1290000000000000001",
		images: [],
		reactions: [
			{ count: 12, name: "🎉" },
			{
				count: 1,
				image: "https://cdn.discordapp.com/emojis/700000000000000001.webp?size=48",
				name: "wolf",
			},
		],
		url: "https://discord.com/channels/254360814063058944/890648971712802906/1290000000000000001",
	},
	{
		apps: [],
		at: "2026-10-15T11:05:00.000Z",
		components: [],
		content: "",
		embeds: [
			{
				color: "#5865f2",
				description: "See [the changelog](https://wolfstar.rocks/changelog).",
				title: "WolfStar v7",
				url: "https://wolfstar.rocks/changelog",
			},
		],
		id: "1290000000000000002",
		images: [],
		reactions: [],
		url: "https://discord.com/channels/254360814063058944/890648971712802906/1290000000000000002",
	},
];

/** The card of an app a post invites to, as `/api/announcements/wolfstar` returns it. */
export const MOCK_APP_INVITE: AnnouncementApp = {
	cover: "https://cdn.discordapp.com/app-icons/1557826376331960380/cover.webp?size=1024",
	description: "Moderation, in alpha.",
	icon: "https://cdn.discordapp.com/app-icons/1557826376331960380/icon.webp?size=160",
	id: "1557826376331960380",
	name: "WolfStar Alpha",
	url: "https://discord.com/oauth2/authorize?client_id=1557826376331960380",
};

/** A post sent with Components V2: a ping, then a container, and no `content`. */
export const MOCK_COMPONENTS_V2: AnnouncementComponent[] = [
	{ content: "<@Subscribers>", kind: "text" },
	{
		accent: "#fee75c",
		components: [
			{ content: "## wolfstar.rocks v0.16.0 preview", kind: "text" },
			{ divider: true, kind: "separator", spacing: "small" },
			{ content: "- **New dashboard** at `/app`", kind: "text" },
			{
				kind: "links",
				links: [
					{ label: "Open wolfstar.rocks", url: "https://wolfstar.rocks" },
					{ label: "Release notes", url: "https://wolfstar.rocks/changelog" },
				],
			},
		],
		kind: "container",
	},
];
