export const useApp = () => {
	const Invites = useInvites();
	const OtherApps = {
		Staryl: {
			avatar: "/avatars/staryl.png",
			description:
				"Staryl brings social updates into Discord. Its public invite is not available yet.",
			explore: "/staryl",
			invite: Invites.Staryl,
			name: "Staryl",
			purposes: ["Social", "Notification"],
		},
		WolfStar: {
			avatar: "/avatars/wolfstar.png",
			description:
				"WolfStar combines configurable moderation, server event logging, and dashboard-managed settings.",
			explore: "/",
			invite: Invites.WolfStar,
			name: "WolfStar",
			purposes: ["Moderation", "Logging"],
		},
	} as const satisfies Record<string, OtherApp>;

	return OtherApps;
};
