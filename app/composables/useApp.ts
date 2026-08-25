export const useApp = () => {
	const Invites = useInvites();
	// `$i18n` rather than `useI18n()`: `useApp()` is also called outside a setup
	// context (unit tests, plain helpers), where `useI18n()` throws. Descriptions
	// are getters so a locale switch re-resolves them on the next render.
	const { t } = useNuxtApp().$i18n;
	const OtherApps = {
		Staryl: {
			avatar: "/avatars/staryl.png",
			get description() {
				return t("marketing.other_apps.staryl_description");
			},
			explore: "/staryl",
			invite: Invites.Staryl,
			name: "Staryl",
			purposes: ["Social", "Notification"],
		},
		WolfStar: {
			avatar: "/avatars/wolfstar.png",
			get description() {
				return t("marketing.other_apps.wolfstar_description");
			},
			explore: "/",
			invite: Invites.WolfStar,
			name: "WolfStar",
			purposes: ["Moderation", "Logging"],
		},
	} as const satisfies Record<string, OtherApp>;

	return OtherApps;
};
