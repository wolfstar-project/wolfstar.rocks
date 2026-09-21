import type { NavigationMenuItem } from "@nuxt/ui";

export function useHeader() {
	const { ts } = useI18n();

	// Safely inject appName with fallback to prevent SSR issues
	const appName = inject(ProviderAppNameKey, ref<"wolfstar" | "staryl">("wolfstar"));

	const apps = useApp();

	const currentApp = computed(() => {
		const appKey = unref(appName)
			.toLocaleLowerCase()
			.replace(/^\w/, (c) => c.toUpperCase()) as "WolfStar" | "Staryl";
		return apps[appKey] || apps.WolfStar;
	});

	const featureLinks = computed(() => [
		{
			description: ts("nav.moderation_tools_description"),
			icon: "lucide:shield-check",
			label: ts("nav.moderation_tools"),
			to: "/wolfstar#moderation-tools",
		},
		{
			description: ts("nav.advanced_logging_description"),
			icon: "lucide:file-text",
			label: ts("nav.advanced_logging"),
			to: "/wolfstar#advanced-logging",
		},
		{
			description: ts("nav.moderation_logs_description"),
			icon: "lucide:search",
			label: ts("nav.moderation_logs"),
			to: "/wolfstar#moderation-logs",
		},
	]);

	const featuresGroup = computed<NavigationMenuItem>(() => ({
		children: featureLinks.value,
		label: ts("nav.features"),
		// The desktop panel is rendered by `AppHeader`'s `#features-content` slot.
		slot: "features",
	}));

	const applicationLinks = computed(() => [
		{
			// `avatar` feeds the desktop panel, `icon` the vertical mobile menu,
			// which renders no avatar of its own.
			avatar: { alt: apps.WolfStar.name, src: apps.WolfStar.avatar },
			description: ts("nav.wolfstar_description"),
			icon: "ph:shield-duotone",
			label: apps.WolfStar.name,
			to: apps.WolfStar.explore,
		},
		{
			avatar: { alt: apps.Staryl.name, src: apps.Staryl.avatar },
			description: ts("nav.staryl_description"),
			icon: "lucide:twitch",
			label: apps.Staryl.name,
			to: apps.Staryl.explore,
		},
	]);

	const applicationsGroup = computed<NavigationMenuItem>(() => ({
		children: applicationLinks.value,
		label: ts("nav.applications"),
		// The desktop panel is rendered by `AppHeader`'s `#applications-content` slot.
		slot: "applications",
	}));

	const commandsLink = computed<NavigationMenuItem>(() => ({
		label: ts("nav.commands"),
		to: "/commands",
		// No dropdown caret, so it keeps even padding where the groups leave room for one.
		ui: { link: "px-4" },
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
			label: ts("nav.github"),
			rel: "noopener noreferrer",
			target: "_blank",
			to: "https://github.com/wolfstar-project/wolfstar.rocks",
		},
	]);

	return {
		applicationLinks,
		currentApp,
		desktopLinks,
		featureLinks,
		mobileLinks,
	};
}
