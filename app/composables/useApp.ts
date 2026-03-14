export const useApp = () => {
	const Invites = useInvites();
	const OtherApps = {
		Staryl: {
			avatar: "/avatars/staryl.png",
			description:
				"An app to help you manage your server's social notifications (Twitch, Instragram and etc.).",
			explore: "/staryl",
			invite: Invites.Staryl,
			name: "Staryl",
			purposes: ["Social", "Notification"],
		},
		WolfStar: {
			avatar: "/avatars/wolfstar.png",
			description: "An app to help you manage your server's moderation and logging.",
			explore: "/",
			invite: Invites.WolfStar,
			name: "WolfStar",
			purposes: ["Moderation", "Logging"],
		},
	} as const satisfies Record<string, OtherApp>;

	return OtherApps;
};
