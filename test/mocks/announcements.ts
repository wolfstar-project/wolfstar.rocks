import type { Announcement } from "#shared/types/announcement";

/** Two posts of WolfStar's announcement channel, as `/api/announcements/wolfstar` returns them. */
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
	{
		at: "2026-10-11T09:12:00.000Z",
		content:
			"## Dashboard v3\nThanks <@Moderator>, read more in <#rules>.\n- Pins\n- Recent modules",
		embeds: [],
		id: "1290000000000000001",
		images: [],
		reactions: [{ count: 12, name: "🎉" }],
		url: "https://discord.com/channels/254360814063058944/890648971712802906/1290000000000000001",
	},
	{
		at: "2026-10-15T11:05:00.000Z",
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
