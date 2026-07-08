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
			label: "Features",
			to: "/#features",
		},
		{
			label: "Other Apps",
			to: "/#apps",
		},
		{
			label: "Support",
			to: "https://join.wolfstar.rocks",
		},
		{
			label: "Docs",
			to: "/commands",
		},
	]);

	const mobileLinks = computed(() => [
		{
			label: "Features",
			to: "/#features",
		},
		{
			label: "Other Apps",
			to: "/#apps",
		},
		{
			icon: "ph:discord-logo-duotone",
			label: "Support",
			to: "https://join.wolfstar.rocks",
		},
		{
			label: "Docs",
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
