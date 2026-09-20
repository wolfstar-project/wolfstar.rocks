import type { NavigationMenuItem } from "@nuxt/ui";

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

	const featuresGroup = computed<NavigationMenuItem>(() => ({
		children: [
			{
				description: t("nav.moderation_tools_description"),
				icon: "lucide:shield-check",
				label: t("nav.moderation_tools"),
				to: "/wolfstar#moderation-tools",
			},
			{
				description: t("nav.advanced_logging_description"),
				icon: "lucide:file-text",
				label: t("nav.advanced_logging"),
				to: "/wolfstar#advanced-logging",
			},
			{
				description: t("nav.moderation_logs_description"),
				icon: "lucide:search",
				label: t("nav.moderation_logs"),
				to: "/wolfstar#moderation-logs",
			},
		],
		label: t("nav.features"),
	}));

	const applicationsGroup = computed<NavigationMenuItem>(() => ({
		children: [
			{
				description: t("nav.wolfstar_description"),
				icon: "ph:shield-duotone",
				label: apps.WolfStar.name,
				to: apps.WolfStar.explore,
			},
			{
				description: t("nav.staryl_description"),
				icon: "lucide:twitch",
				label: apps.Staryl.name,
				to: apps.Staryl.explore,
			},
		],
		label: t("nav.applications"),
	}));

	const commandsLink = computed<NavigationMenuItem>(() => ({
		label: t("nav.commands"),
		to: "/commands",
	}));

	const desktopLinks = computed<NavigationMenuItem[]>(() => [
		featuresGroup.value,
		applicationsGroup.value,
		commandsLink.value,
	]);

	const mobileLinks = computed<NavigationMenuItem[]>(() => [
		featuresGroup.value,
		applicationsGroup.value,
		commandsLink.value,
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
