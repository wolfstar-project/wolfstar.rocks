export function useHeader() {
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
					description: "Tools to help you moderate your server",
					label: "Moderation Tools",
					to: "#moderation-tools",
				},
				{
					description: "Track and log events in your server",
					label: "Advanced Logging",
					to: "#advanced-logging",
				},
			],
			label: "Features",
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
			label: "Applications",
		},
		...(currentApp.value.invite !== "#"
			? [
					{
						icon: "ph:plus-circle-duotone",
						label: "Invite App",
						to: currentApp.value.invite,
					},
				]
			: []),
		{
			label: "Commands",
			to: "/commands",
		},
	]);

	const mobileLinks = computed(() => [
		{
			children: [
				{
					label: "Moderation Tools",
				},
				{
					label: "Advanced Logging",
				},
			],
			label: "Features",
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
			label: "Applications",
		},
		{
			label: "Commands",
			to: "/commands",
		},
		...(currentApp.value.invite !== "#"
			? [
					{
						icon: "ph:plus-circle-duotone",
						label: "Invite App",
						to: currentApp.value.invite,
					},
				]
			: []),
		{
			icon: "lucide:github",
			label: "GitHub",
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
