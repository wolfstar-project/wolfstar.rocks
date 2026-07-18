export function useHeader() {
	const { t } = useI18n();

	// Safely inject appName with fallback to prevent SSR issues
	const appName = inject(ProviderAppNameKey, ref<"wolfstar" | "staryl">("wolfstar"));

	const apps = useApp();

	const currentApp = computed(() => {
		const appKey = unref(appName)
			.toLocaleLowerCase()
			.replace(/^\w/, (c) => c.toUpperCase()) as "WolfStar" | "Staryl";
		return apps[appKey] || apps.WolfStar;
	});

	const desktopLinks = computed(() => [
		{
			children: [
				{
					description: t("nav.moderation_tools_description"),
					label: t("nav.moderation_tools"),
					to: "#moderation-tools",
				},
				{
					description: t("nav.advanced_logging_description"),
					label: t("nav.advanced_logging"),
					to: "#advanced-logging",
				},
				{
					description: t("nav.moderation_logs_description"),
					label: t("nav.moderation_logs"),
					to: "#moderation-logs",
				},
			],
			label: t("nav.features"),
		},
		{
			children: [
				{
					icon: "ph:shield-duotone",
					label: "WolfStar",
					to: "/",
				},
				{
					icon: "lucide:twitch",
					label: "Staryl",
					to: "/staryl",
				},
			],
			label: t("nav.applications"),
		},
		{
			label: t("nav.commands"),
			to: "/commands",
		},
		{
			label: t("nav.blog"),
			to: "/blog",
		},
	]);

	const mobileLinks = computed(() => [
		{
			children: [
				{
					label: t("nav.moderation_tools"),
				},
				{
					label: t("nav.advanced_logging"),
				},
				{
					label: t("nav.moderation_logs"),
				},
			],
			label: t("nav.features"),
		},
		{
			children: [
				{
					icon: "ph:shield-duotone",
					label: "WolfStar",
					to: "/",
				},
				{
					icon: "lucide:twitch",
					label: "Staryl",
					to: "/staryl",
				},
			],
			label: t("nav.applications"),
		},
		{
			label: t("nav.commands"),
			to: "/commands",
		},
		{
			label: t("nav.blog"),
			to: "/blog",
		},
		{
			icon: "lucide:github",
			label: t("nav.github"),
			rel: "noopener noreferrer",
			target: "_blank",
			to: "https://github.com/wolfstar-project/wolfstar.rocks",
		},
	]);

	return {
		currentApp,
		desktopLinks,
		mobileLinks,
	};
}
